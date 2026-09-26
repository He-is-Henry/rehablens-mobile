import { useAuth } from "@/context/auth.context";
import { useNetwork } from "@/context/network.context";
import { sendLocalNotification } from "@/lib/notifications";
import { finishSessionResult, startSessionResult } from "@/lib/patient";
import { createQueue } from "./useQueue";

interface PendingFinish {
  sessionId: string;
  payload: {
    repsCompleted: number;
    durationSeconds: number;
    status: "completed" | "abandoned";
    timeZone: string;
    scheduleId?: string;
    assignmentId?: string;
  };
}

const sessionQueue = createQueue<PendingFinish>("session:pending-finish");

export function useSessionQueue() {
  const { isOnline } = useNetwork();
  const { user } = useAuth();
  const { enqueue, dequeue, clear } = sessionQueue.useQueue();

  const start = async (payload: {
    scheduleId: string;
    assignmentId: string;
    timeZone: string;
  }) => {
    if (!isOnline) {
      return { _id: `offline_${Date.now()}`, _offline: true };
    }
    return startSessionResult(payload);
  };

  const calculatePoints = (params: {
    repsCompleted: number;
    targetReps: number;
    holdSeconds: number;
    repTriggerCount: number;
  }): number => {
    const { repsCompleted, targetReps, holdSeconds, repTriggerCount } = params;

    const completionRatio = Math.min(repsCompleted / targetReps, 1);
    const difficultyMultiplier =
      1 + holdSeconds / 10 + Math.max(0, repTriggerCount - 1) * 0.5;

    return Math.round(completionRatio * 10 * difficultyMultiplier);
  };

  function getYesterdayDateString(todayStr: string): string {
    const date = new Date(`${todayStr}T00:00:00`);
    date.setDate(date.getDate() - 1);

    return date.toLocaleDateString("en-CA");
  }

  const finish = async (
    sessionId: string,
    payload: PendingFinish["payload"],
    metadata: {
      targetReps: number;
      holdSeconds: number;
      repTriggerCount: number;
    },
  ) => {
    if (!isOnline || sessionId.startsWith("offline_")) {
      const pointsAwarded = calculatePoints({
        ...metadata,
        repsCompleted: payload.repsCompleted,
      });

      const today = new Date().toLocaleDateString("en-CA");
      const yesterday = getYesterdayDateString(today);

      const streakExtended = user?.lastCompletedDate === yesterday;

      const newStreak = streakExtended
        ? user.currentStreak + 1
        : (user?.currentStreak ?? 0);

      await enqueue({ sessionId, payload });
      return {
        pointsAwarded,
        newStreak,
        streakExtended,
        rankMovedUp: false,
        newRank: 0,
        previousRank: 0,
        _offline: true,
      };
    }
    return finishSessionResult(sessionId, payload);
  };

  const flush = async () => {
    if (!isOnline) return;

    console.log("Flushing...");
    const queue = await dequeue();
    if (!queue.length) return;

    sendLocalNotification(
      "Syncing sessions",
      `Uploading ${queue.length} offline session${queue.length > 1 ? "s" : ""}...`,
    );

    const failed: typeof queue = [];

    for (const item of queue) {
      try {
        const payload = item.payload.payload;
        if (payload.scheduleId?.startsWith("offline_")) {
          if (item.payload.payload.scheduleId && payload.assignmentId) {
            await finishSessionResult("", item.payload.payload);
          }
          continue;
        }
        await finishSessionResult(item.payload.sessionId, item.payload.payload);
      } catch {
        failed.push(item);
      }
    }

    await clear(failed);

    sendLocalNotification(
      failed.length ? "Sync incomplete" : "Sync complete",
      failed.length
        ? `${failed.length} session${failed.length > 1 ? "s" : ""} couldn't upload. Will retry when online.`
        : "Your sessions have been saved successfully.",
    );
  };

  return { start, finish, flush };
}
