import { Camera as PoseCamera } from '@scottjgilroy/react-native-vision-camera-v4-pose-detection';
import { router, useLocalSearchParams } from 'expo-router';
import * as Speech from 'expo-speech';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  useWindowDimensions
} from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import {
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';

import { colors } from '@/constants/theme';
import { useAuth } from '@/context/auth.context';
import { usePatientQuery } from '@/queries/patient';

import { useNetwork } from '@/context/network.context';
import { useSessionQueue } from '@/hooks/useSessionQueue';
import { runOnJS } from 'react-native-worklets';
import { ExerciseHUD } from '../components/exercise/ExerciseHUD';
import {
  FRAME_H,
  FRAME_W,
  getAngle,
  meetsAllOrAny,
} from '../components/exercise/exerciseMath';
import { ExerciseTopBar } from '../components/exercise/ExerciseTopBar';
import { ExitConfirmModal } from '../components/exercise/ExitConfirmModal';
import { PreStartScreen } from '../components/exercise/PreStartScreen';
import { SessionSummaryOverlay } from '../components/exercise/SessionSummaryOverlay';
import { SkeletonOverlay } from '../components/exercise/SkeletonOverlay';
import { StreakCelebrationOverlay } from '../components/exercise/StreakCelebrationOverlay';

const Camera = PoseCamera as any;

const repStateColor: Record<RepState, string> = {
  rest: '#ffffff',
  triggered: '#facc15',
  holding: '#00ff88',
  returning: '#60a5fa',
};

export default function ExerciseScreen() {
  const { scheduleId } = useLocalSearchParams<{ scheduleId: string }>();

  const { data: schedule, loading: loadingSchedule } =
    usePatientQuery.scheduleById(scheduleId);
  const { start, finish } = useSessionQueue();
  const { isOnline } = useNetwork()

  const { requireStorage } = useAuth();
  const storage = requireStorage();

  const assignment = schedule?.assignmentId
  const exercise = assignment?.exerciseId

  const targetReps = assignment?.customReps ?? exercise?.targetReps ?? 0;
  const holdSeconds = assignment?.customHoldSeconds ?? exercise?.holdSeconds ?? 0;

  const { hasPermission, requestPermission } = useCameraPermission();

  const [cameraFacing, setCameraFacing] = useState<'front' | 'back'>('front');
  const device = useCameraDevice(cameraFacing);

  const toggleCamera = () => {
    setCameraFacing(f => f === 'front' ? 'back' : 'front');
  }; const { width: W, height: H } = useWindowDimensions();

  const scaleX = W / FRAME_W;
  const scaleY = H / FRAME_H;

  const [started, setStarted] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const isTrackingRef = useRef(false);

  const [countdown, setCountdown] = useState<number | null>(null);

  // High-frequency Shared Values
  const poseShared = useSharedValue<Pose | null>(null);
  const holdProgressShared = useSharedValue<number>(0);
  const primaryAngleShared = useSharedValue<number | null>(null);

  const [hasPose, setHasPose] = useState(false);
  const [primaryAngle, setPrimaryAngle] = useState<number | null>(null);

  // Low-frequency React State
  const [repState, setRepState] = useState<RepState>('rest');
  const repStateRef = useRef<RepState>('rest');

  const [repsCompleted, setRepsCompleted] = useState(0);
  const repsRef = useRef(0);

  const holdStartRef = useRef<number | null>(null);
  const lastPoseTimeRef = useRef(0);
  const lastRenderRef = useRef(0);
  const sessionStartRef = useRef<number | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  const [speechEnabled, setSpeechEnabled] = useState(true);

  const [showSummary, setShowSummary] = useState(false);
  const [showStreak, setShowStreak] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [summaryData, setSummaryData] = useState({
    pointsAwarded: 0,
    durationSeconds: 0,
    newStreak: 0,
    streakExtended: false,
    rankMovedUp: false as boolean | number,
    newRank: 0,
    previousRank: 0,
    offline: !isOnline
  });

  // HOOKS

  useEffect(() => {
    if (!hasPermission) requestPermission();
  }, [hasPermission, requestPermission]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isTrackingRef.current) {
        setHasPose(false);
        setPrimaryAngle(null);
        return;
      }
      if (Date.now() - lastPoseTimeRef.current > 500) {
        setHasPose(false);
        setPrimaryAngle(null);
      }
    }, 250);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (countdown === null) return;

    if (countdown === 0) {
      setCountdown(null);
      isTrackingRef.current = true;
      setIsTracking(true);
      if (!sessionStartRef.current) sessionStartRef.current = Date.now();

      if (scheduleId && assignment?._id && !sessionIdRef.current) {
        start({
          scheduleId,
          assignmentId: assignment._id,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        })
          .then((data) => {
            sessionIdRef.current = data._id;
          })
          .catch((err) =>
            console.error('Failed to start session on backend:', err),
          );
      }
      return;
    }

    const timer = setTimeout(() => setCountdown((c) => (c ?? 1) - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, scheduleId, assignment, targetReps]);

  useEffect(() => {
    storage.get('speechEnabled').then((val) => {
      if (val) {
        const { data } = val;
        if (typeof data === 'boolean') setSpeechEnabled(data);
      }
    });
  }, []);

  useEffect(() => {
    if (!isTracking || !speechEnabled || countdown !== null || !exercise) return;
    const text = exercise.repStateInstructions[repState];
    if (!text) return;
    Speech.stop();
    Speech.speak(text);
  }, [repState, isTracking, speechEnabled, countdown, exercise]);

  useEffect(() => {
    if (!isTracking) Speech.stop();
  }, [isTracking]);

  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  // HELPER FUNCTIONS
  const toggleSpeech = () => {
    setSpeechEnabled((prev) => {
      const next = !prev;
      storage.set('speechEnabled', next);
      return next;
    });
  };

  const beginTracking = () => {
    setCountdown(3);
  };

  const triggerRepStateMachine = (currentPose: Pose) => {
    if (!exercise) return;
    const triggers = exercise.repTriggers;
    const combinator = exercise.repTriggerCombinator;
    const state = repStateRef.current;

    if (state === 'rest') {
      if (meetsAllOrAny(currentPose, triggers, combinator, 'target')) {
        repStateRef.current = 'triggered';
        setRepState('triggered');
        holdStartRef.current = Date.now();
        holdProgressShared.value = 0;
      }
    } else if (state === 'triggered' || state === 'holding') {
      if (!meetsAllOrAny(currentPose, triggers, combinator, 'target')) {
        holdStartRef.current = Date.now();
        repStateRef.current = 'triggered';
        setRepState('triggered');
        holdProgressShared.value = 0;
        return;
      }

      if (state !== 'holding') {
        repStateRef.current = 'holding';
        setRepState('holding');
      }

      const elapsed = (Date.now() - (holdStartRef.current ?? Date.now())) / 1000;
      holdProgressShared.value = Math.min(elapsed / holdSeconds, 1);

      if (elapsed >= holdSeconds) {
        repStateRef.current = 'returning';
        setRepState('returning');
        holdStartRef.current = null;
        holdProgressShared.value = 1;
      }
    } else if (state === 'returning') {
      if (meetsAllOrAny(currentPose, triggers, combinator, 'reset')) {
        const newReps = repsRef.current + 1;
        repsRef.current = newReps;
        setRepsCompleted(newReps);
        repStateRef.current = 'rest';
        setRepState('rest');
        holdProgressShared.value = 0;

        if (newReps >= targetReps) {
          isTrackingRef.current = false;
          setIsTracking(false);
          const duration = sessionStartRef.current
            ? Math.round((Date.now() - sessionStartRef.current) / 1000)
            : 0;

          if (sessionIdRef.current) {
            finish(sessionIdRef.current, {
              repsCompleted: newReps,
              durationSeconds: duration,
              status: 'completed',
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              scheduleId,
              assignmentId: assignment._id,
            }, {
              repTriggerCount: exercise.repTriggers.length,
              targetReps,
              holdSeconds,
            })
              .then((res) => {
                setSummaryData({
                  pointsAwarded: res.pointsAwarded ?? 0,
                  durationSeconds: duration,
                  newStreak: res.newStreak ?? 0,
                  streakExtended: res.streakExtended ?? false,
                  rankMovedUp: res.rankMovedUp ?? false,
                  newRank: res.newRank ?? 0,
                  previousRank: res.previousRank ?? 0,
                  offline: res?._offline ?? false
                });
                setShowSummary(true);
              })
              .catch(() => {
                setSummaryData({
                  pointsAwarded: 0,
                  durationSeconds: duration,
                  newStreak: 0,
                  streakExtended: false,
                  rankMovedUp: false,
                  newRank: 0,
                  previousRank: 0,
                  offline: !isOnline
                });
                setShowSummary(true);
              });
          }
        }
      }
    };
  }

  const handleBackPress = () => {
    if (repsRef.current > 0 && repsCompleted < targetReps) {
      setShowExitConfirm(true);
      return;
    }
    router.back();
  };

  const handleTogglePause = () => {
    if (!isTracking) {
      beginTracking();
      return;
    }
    isTrackingRef.current = false;
    setIsTracking(false);
    poseShared.value = null;
    holdProgressShared.value = 0;
    primaryAngleShared.value = null;
    setPrimaryAngle(null);
    setHasPose(false);
    repStateRef.current = 'rest';
    setRepState('rest');
    holdStartRef.current = null;
  };

  const handleSummaryContinue = () => {
    setShowSummary(false);

    if (summaryData.streakExtended) {
      setShowStreak(true);
      return;
    }

    if (summaryData.rankMovedUp) {
      router.push({
        pathname: '/(patient)/(tabs)/leaderboard',
        params: {
          rankMovedUp: 'true',
          previousRank: summaryData.previousRank.toString(),
          newRank: summaryData.newRank.toString(),
        },
      });
      return;
    }

    router.back();
  };

  const handleStreakClose = () => {
    setShowStreak(false);

    if (summaryData.rankMovedUp) {
      router.push({
        pathname: '/(patient)/(tabs)/leaderboard',
        params: {
          rankMovedUp: 'true',
          previousRank: summaryData.previousRank.toString(),
          newRank: summaryData.newRank.toString(),
        },
      });
      return;
    }

    router.back();
  };

  // EARLY RETURNS 
  if (loadingSchedule) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!schedule || !assignment || !exercise) {
    return (
      <View style={styles.center}>
        <Text style={{ color: '#fff' }}>Scheduled session not found</Text>
      </View>
    );
  }

  if (!hasPermission || !device) {
    return (
      <View style={styles.center}>
        <Text style={{ color: '#fff' }}>Waiting for camera permission...</Text>
      </View>
    );
  }

  if (!started) {
    return (
      <PreStartScreen
        schedule={schedule}
        assignment={assignment}
        speechEnabled={speechEnabled}
        onToggleSpeech={toggleSpeech}
        onStart={() => {
          setStarted(true);
          beginTracking();
        }}
      />
    );
  }

  const primaryCheck = exercise.angleChecks?.[0];
  const currentInstruction = isTracking && exercise
    ? exercise.repStateInstructions[repState]
    : 'Paused';

  return (
    <View style={styles.container}>
      <Camera
        device={device}
        style={StyleSheet.absoluteFill}
        isActive={true}
        pixelFormat="yuv"
        options={{ mode: 'stream', performanceMode: 'max' }}
        callback={(newPose: Pose) => {
          if (!newPose) return;
          lastPoseTimeRef.current = Date.now();
          if (!isTrackingRef.current) return;

          const now = Date.now();
          if (now - lastRenderRef.current < 33) return;
          lastRenderRef.current = now;

          poseShared.value = newPose;
          if (!hasPose) setHasPose(true);

          if (primaryCheck) {
            const angle = getAngle(newPose, primaryCheck);
            primaryAngleShared.value = angle;
            runOnJS(setPrimaryAngle)(angle);

            triggerRepStateMachine(newPose);
          }
        }
        } />

      {isTracking && (
        <SkeletonOverlay
          pose={poseShared}
          scaleX={scaleX}
          scaleY={scaleY}
          color={repStateColor[repState]}
        />
      )}

      <ExerciseTopBar
        exerciseName={exercise.name}
        repsCompleted={repsCompleted}
        targetReps={targetReps}
        onBackPress={handleBackPress}
        toggleCamera={toggleCamera}
      />

      <ExerciseHUD
        countdown={countdown}
        targetReps={targetReps}
        repsCompleted={repsCompleted}
        primaryAngle={primaryAngle}
        repState={repState}
        currentInstruction={currentInstruction}
        holdProgress={holdProgressShared as any}
        hasPose={hasPose}
        isTracking={isTracking}
        repStateColor={repStateColor}
        onTogglePause={handleTogglePause}
      />

      <SessionSummaryOverlay
        visible={showSummary}
        exerciseName={exercise.name}
        repsCompleted={repsCompleted}
        targetReps={targetReps}
        durationSeconds={summaryData.durationSeconds}
        pointsAwarded={summaryData.pointsAwarded}
        onContinue={handleSummaryContinue}
      />

      <StreakCelebrationOverlay
        visible={showStreak}
        streakCount={summaryData.newStreak}
        onClose={handleStreakClose}
      />
      <ExitConfirmModal
        visible={showExitConfirm}
        repsCompleted={repsCompleted}
        targetReps={targetReps}
        onSaveAndExit={() => {
          setShowExitConfirm(false);
          if (sessionIdRef.current) {
            const duration = sessionStartRef.current
              ? Math.round((Date.now() - sessionStartRef.current) / 1000)
              : 0;
            finish(sessionIdRef.current, {
              repsCompleted: repsRef.current,
              durationSeconds: duration,
              status: 'abandoned',
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              scheduleId,
              assignmentId: assignment._id,
            },
              {
                targetReps,
                holdSeconds,
                repTriggerCount: exercise.repTriggers.length
              }).catch(() => { });
          }
          router.back();
        }}
        onExitWithoutSaving={() => {
          setShowExitConfirm(false);
          router.back();
        }}
        onCancel={() => setShowExitConfirm(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },

});