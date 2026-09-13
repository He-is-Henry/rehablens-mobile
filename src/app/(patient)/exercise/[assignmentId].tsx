import { colors, radius, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/context/auth.context';
import { createSessionResult, getPatientAssignmentById } from '@/lib/patient';
import { Ionicons } from '@expo/vector-icons';
import { Camera as PoseCamera } from '@scottjgilroy/react-native-vision-camera-v4-pose-detection';
import { router, useLocalSearchParams } from 'expo-router';
import * as Speech from 'expo-speech';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
  useWindowDimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';


const Camera = PoseCamera as any;

// ─── Math ─────────────────────────────────────────────────────────────────────

function calculateAngle(a: Point, b: Point, c: Point): number {
  const ba = { x: a.x - b.x, y: a.y - b.y };
  const bc = { x: c.x - b.x, y: c.y - b.y };
  const dot = ba.x * bc.x + ba.y * bc.y;
  const mag =
    Math.sqrt(ba.x ** 2 + ba.y ** 2) * Math.sqrt(bc.x ** 2 + bc.y ** 2);
  if (mag === 0) return 0;
  return (Math.acos(Math.max(-1, Math.min(1, dot / mag))) * 180) / Math.PI;
}

function getAngle(pose: Pose, check: AngleCheck | RepTrigger): number | null {
  const a = pose[check.a];
  const b = pose[check.b];
  const c = pose[check.c];
  if (!a || !b || !c) return null;
  return calculateAngle(a, b, c);
}

function meetsTarget(
  angle: number,
  target: number,
  direction: 'above' | 'below',
): boolean {
  return direction === 'above' ? angle >= target : angle <= target;
}

function meetsAllOrAny(
  pose: Pose,
  triggers: RepTrigger[],
  combinator: RepTriggerCombinator,
  targetOrReset: 'target' | 'reset',
): boolean {
  const results = triggers.map((trigger) => {
    const angle = getAngle(pose, trigger);
    if (angle === null) return false;
    const target =
      targetOrReset === 'target' ? trigger.targetAngle : trigger.resetAngle;
    const direction =
      targetOrReset === 'target'
        ? trigger.targetDirection
        : trigger.resetDirection;
    return meetsTarget(angle, target, direction);
  });

  return combinator === 'all' ? results.every(Boolean) : results.some(Boolean);
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const FRAME_W = 480;
const FRAME_H = 960;
const MIRRORED = true;

function mapX(x: number, scaleX: number): number {
  return MIRRORED ? (FRAME_W - x) * scaleX : x * scaleX;
}

function SkeletonLine({
  start, end, scaleX, scaleY, color = '#00ff88',
}: {
  start: Point; end: Point;
  scaleX: number; scaleY: number; color?: string;
}) {
  const x1 = mapX(start.x, scaleX), y1 = start.y * scaleY;
  const x2 = mapX(end.x, scaleX), y2 = end.y * scaleY;
  const dx = x2 - x1, dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  return (
    <View
      style={[
        styles.skeletonLine,
        {
          left: x1, top: y1, width: length,
          backgroundColor: color,
          transform: [{ rotate: `${angle}deg` }],
        },
      ]}
    />
  );
}

function SkeletonDot({
  point, scaleX, scaleY, size = 10, color = '#fff',
}: {
  point: Point; scaleX: number; scaleY: number;
  size?: number; color?: string;
}) {
  return (
    <View
      style={[
        styles.skeletonDot,
        {
          width: size, height: size, borderRadius: size / 2,
          left: mapX(point.x, scaleX) - size / 2,
          top: point.y * scaleY - size / 2,
          backgroundColor: color,
        },
      ]}
    />
  );
}

// ─── Pre-start screen ─────────────────────────────────────────────────────────

function PreStartScreen({
  assignment,
  onStart,
  speechEnabled,
  onToggleSpeech,
}: {
  assignment: Assignment;
  onStart(): void;
  speechEnabled: boolean;
  onToggleSpeech(): void;
}) {
  const exercise = assignment.exerciseId;
  const targetReps = assignment.customReps ?? exercise.targetReps;
  const holdSeconds = assignment.customHoldSeconds ?? exercise.holdSeconds;
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.preStart, { paddingTop: insets.top }]}>
      <Pressable onPress={() => router.back()} hitSlop={8} style={styles.preStartBack}>
        <Text style={styles.preStartBackText}>← Back</Text>
      </Pressable>

      <ScrollView contentContainerStyle={styles.preStartContent}>
        <Text style={styles.preStartName}>{exercise.name}</Text>
        <Text style={styles.preStartDesc}>{exercise.description}</Text>

        <View style={styles.infoCard}>
          <Text style={styles.infoCardLabel}>How to do it</Text>
          <Text style={styles.infoCardText}>{exercise.instructions}</Text>
        </View>

        <View style={[styles.infoCard, styles.infoCardAccent]}>
          <View style={styles.infoCardLabelRow}>
            <Ionicons name="camera-outline" size={14} color={colors.textGrey} />
            <Text style={styles.infoCardLabel}>Camera position</Text>
          </View>
          <Text style={styles.infoCardText}>{exercise.cameraOrientationTip}</Text>
        </View>

        <View style={styles.speechRow}>
          <View style={styles.speechRowText}>
            <Ionicons name="volume-high-outline" size={18} color={colors.textDark} />
            <Text style={styles.speechLabel}>Read instructions aloud</Text>
          </View>
          <Switch
            value={speechEnabled}
            onValueChange={onToggleSpeech}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>

        <View style={styles.statsRow}>
          <StatBox label="Reps" value={String(targetReps)} />
          <StatBox label="Hold each" value={`${holdSeconds}s`} />
        </View>

        {assignment.notes && (
          <View style={styles.notesCard}>
            <Text style={styles.notesLabel}>Note from your staff</Text>
            <Text style={styles.notesText}>{assignment.notes}</Text>
          </View>
        )}

        <Text style={styles.phaseTitle}>What to expect</Text>
        <View style={styles.phaseList}>
          <PhaseRow color="#facc15" label="Trigger" text={exercise.repStateInstructions.triggered} />
          <PhaseRow color="#00ff88" label="Hold" text={exercise.repStateInstructions.holding} />
          <PhaseRow color="#60a5fa" label="Return" text={exercise.repStateInstructions.returning} />
        </View>
      </ScrollView>

      <View style={[styles.preStartFooter, { paddingBottom: insets.bottom + spacing.md }]}>
        <Pressable style={({ pressed }) => [styles.startBtn, pressed && { opacity: 0.85 }]} onPress={onStart}>
          <Text style={styles.startBtnText}>Start exercise</Text>
        </Pressable>
      </View>
    </View>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function PhaseRow({
  color,
  label,
  text,
}: {
  color: string;
  label: string;
  text: string;
}) {
  return (
    <View style={styles.phaseRow}>
      <View style={[styles.phaseDot, { backgroundColor: color }]} />
      <View style={styles.phaseRowInfo}>
        <Text style={styles.phaseRowLabel}>{label}</Text>
        <Text style={styles.phaseRowText}>{text}</Text>
      </View>
    </View>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ExerciseScreen() {
  const { assignmentId } = useLocalSearchParams<{ assignmentId: string }>();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loadingAssignment, setLoadingAssignment] = useState(true);
  const { requireStorage } = useAuth();
  const storage = requireStorage()



  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('front');
  const { width: W, height: H } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const scaleX = W / FRAME_W;
  const scaleY = H / FRAME_H;

  const [started, setStarted] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const isTrackingRef = useRef(false);

  const [countdown, setCountdown] = useState<number | null>(null);

  const [pose, setPose] = useState<Pose | null>(null);
  const [hasPose, setHasPose] = useState(false);

  const [repState, setRepState] = useState<RepState>('rest');
  const repStateRef = useRef<RepState>('rest');

  const [repsCompleted, setRepsCompleted] = useState(0);
  const repsRef = useRef(0);

  const holdStartRef = useRef<number | null>(null);
  const lastPoseTimeRef = useRef(0);
  const lastRenderRef = useRef(0);
  const sessionStartRef = useRef<number | null>(null);

  const [finished, setFinished] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);

  const [speechEnabled, setSpeechEnabled] = useState(true);


  const exercise = assignment?.exerciseId!;
  const targetReps = assignment?.customReps ?? exercise?.targetReps!;
  const holdSeconds = assignment?.customHoldSeconds ?? exercise?.holdSeconds!;


  useEffect(() => {
    console.log(assignmentId)
    getPatientAssignmentById(assignmentId)
      .then(setAssignment)
      .finally(() => setLoadingAssignment(false));
  }, [assignmentId]);

  useEffect(() => {
    if (!hasPermission) requestPermission();
  }, [hasPermission, requestPermission]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isTrackingRef.current) { setHasPose(false); return; }
      if (Date.now() - lastPoseTimeRef.current > 500) setHasPose(false);
    }, 250);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (repStateRef.current !== 'holding' || !holdStartRef.current) {
        setHoldProgress(0);
        return;
      }
      const elapsed = (Date.now() - holdStartRef.current) / 1000;
      setHoldProgress(Math.min(elapsed / holdSeconds, 1));
    }, 50);
    return () => clearInterval(interval);
  }, [holdSeconds]);

  useEffect(() => {
    if (countdown === null) return;

    if (countdown === 0) {
      setCountdown(null);
      isTrackingRef.current = true;
      setIsTracking(true);
      if (!sessionStartRef.current) sessionStartRef.current = Date.now();
      return;
    }

    const timer = setTimeout(() => setCountdown((c) => (c ?? 1) - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    storage.get('speechEnabled').then((val) => {
      if (val) {
        const { data } = val
        if (typeof data === 'boolean') setSpeechEnabled(data);
      }
    });
  }, []);

  const toggleSpeech = () => {
    setSpeechEnabled((prev) => {
      const next = !prev;
      storage.set('speechEnabled', next);
      return next;
    });
  };

  useEffect(() => {
    if (!isTracking || !speechEnabled || countdown !== null || !exercise) return;
    const text = exercise.repStateInstructions[repState];
    if (!text) return;
    Speech.stop();
    Speech.speak(text);
  }, [repState, isTracking, speechEnabled]);

  useEffect(() => {
    if (!isTracking) Speech.stop();
  }, [isTracking]);

  useEffect(() => {
    return () => { Speech.stop(); };
  }, []);


  if (loadingAssignment) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!assignment) {
    return (
      <View style={styles.center}>
        <Text style={{ color: '#fff' }}>Assignment not found</Text>
      </View>
    );
  }



  const beginTracking = () => {
    setCountdown(3);
  };

  const triggerRepStateMachine = (currentPose: Pose) => {
    const triggers = exercise.repTriggers;
    const combinator = exercise.repTriggerCombinator;
    const state = repStateRef.current;

    if (state === 'rest') {
      if (meetsAllOrAny(currentPose, triggers, combinator, 'target')) {
        repStateRef.current = 'triggered';
        setRepState('triggered');
        holdStartRef.current = Date.now();
      }
    } else if (state === 'triggered' || state === 'holding') {
      if (!meetsAllOrAny(currentPose, triggers, combinator, 'target')) {
        holdStartRef.current = Date.now();
        repStateRef.current = 'triggered';
        setRepState('triggered');
        return;
      }
      repStateRef.current = 'holding';
      setRepState('holding');
      const elapsed = (Date.now() - (holdStartRef.current ?? Date.now())) / 1000;
      if (elapsed >= holdSeconds) {
        repStateRef.current = 'returning';
        setRepState('returning');
        holdStartRef.current = null;
      }
    } else if (state === 'returning') {
      if (meetsAllOrAny(currentPose, triggers, combinator, 'reset')) {
        const newReps = repsRef.current + 1;
        repsRef.current = newReps;
        setRepsCompleted(newReps);
        repStateRef.current = 'rest';
        setRepState('rest');
        if (newReps >= targetReps) {
          isTrackingRef.current = false;
          setIsTracking(false);
          const duration = sessionStartRef.current
            ? Math.round((Date.now() - sessionStartRef.current) / 1000)
            : 0;
          createSessionResult({
            assignmentId: assignment._id,
            repsCompleted: newReps,
            targetReps,
            durationSeconds: duration,
            status: 'completed',
          }).catch(() => { });
          setFinished(true);
        }
      }
    }
  };

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

  const primaryCheck = exercise.angleChecks[0];
  const primaryAngle = pose && primaryCheck ? getAngle(pose, primaryCheck) : null;

  const connections: [Point, Point][] = [];
  if (pose) {
    const pairs: [string, string][] = [
      ['leftShoulderPosition', 'leftElbowPosition'],
      ['leftElbowPosition', 'leftWristPosition'],
      ['rightShoulderPosition', 'rightElbowPosition'],
      ['rightElbowPosition', 'rightWristPosition'],
      ['leftShoulderPosition', 'rightShoulderPosition'],
      ['leftShoulderPosition', 'leftHipPosition'],
      ['rightShoulderPosition', 'rightHipPosition'],
      ['leftHipPosition', 'rightHipPosition'],
      ['leftHipPosition', 'leftKneePosition'],
      ['leftKneePosition', 'leftAnklePosition'],
      ['rightHipPosition', 'rightKneePosition'],
      ['rightKneePosition', 'rightAnklePosition'],
    ];
    for (const [a, b] of pairs) {
      const pa = pose[a as keyof Pose];
      const pb = pose[b as keyof Pose];
      if (pa && pb) connections.push([pa, pb]);
    }
  }

  const repStateColor: Record<RepState, string> = {
    rest: '#ffffff',
    triggered: '#facc15',
    holding: '#00ff88',
    returning: '#60a5fa',
  };

  const currentInstruction = isTracking
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
          if (now - lastRenderRef.current < 100) return;
          lastRenderRef.current = now;
          setPose(newPose);
          setHasPose(true);
          triggerRepStateMachine(newPose);
        }}
      />

      {/* Skeleton — hidden during countdown, only shown once actually tracking */}
      {isTracking && pose && (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          {connections.map(([s, e], i) => (
            <SkeletonLine
              key={i} start={s} end={e}
              scaleX={scaleX} scaleY={scaleY}
              color={repStateColor[repState]}
            />
          ))}
          {Object.values(pose)
            .filter(Boolean)
            .map((p, i) => (
              <SkeletonDot
                key={i}
                point={p as Point}
                scaleX={scaleX}
                scaleY={scaleY}
                color={repStateColor[repState]}
              />
            ))}
        </View>
      )}

      {/* Top bar — always visible */}
      <View style={[styles.topBar, { paddingTop: insets.top + spacing.xs }]}>
        <Pressable
          onPress={() => {
            if (repsRef.current > 0 && sessionStartRef.current) {
              const duration = Math.round((Date.now() - sessionStartRef.current) / 1000);
              createSessionResult({
                assignmentId: assignment._id,
                repsCompleted: repsRef.current,
                targetReps,
                durationSeconds: duration,
                status: 'abandoned',
              }).catch(() => { });
            }
            router.back();
          }}
          hitSlop={8}
        >
          <Text style={styles.topBarBack}>←</Text>
        </Pressable>
        <Text style={styles.topBarTitle}>{exercise.name}</Text>
        <Text style={styles.topBarReps}>
          {repsCompleted}/{targetReps}
        </Text>
      </View>

      {/* Countdown overlay — camera visible behind it, skeleton not yet */}
      {countdown !== null && (
        <View style={styles.countdownOverlay}>
          <Text style={styles.countdownNumber}>
            {countdown === 0 ? 'Go!' : countdown}
          </Text>
          <Text style={styles.countdownHint}>Get into position</Text>
        </View>
      )}

      {/* Minimal active HUD */}
      {!finished && countdown === null && (
        <View
          style={[
            styles.hud,
            { paddingBottom: insets.bottom + spacing.sm },
          ]}
        >
          <View style={styles.repsRow}>
            {Array.from({ length: targetReps }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.repDot,
                  i < repsCompleted && styles.repDotDone,
                  i === repsCompleted &&
                  repState !== 'rest' &&
                  styles.repDotActive,
                ]}
              />
            ))}
          </View>

          <View style={styles.hudMain}>
            {primaryAngle !== null && (
              <Text style={styles.hudAngle}>
                {Math.round(primaryAngle)}°
              </Text>
            )}
            <Text
              style={[
                styles.hudInstruction,
                { color: repStateColor[repState] },
              ]}
              numberOfLines={2}
            >
              {currentInstruction}
            </Text>
          </View>

          {repState === 'holding' && (
            <View style={styles.holdBarContainer}>
              <View
                style={[
                  styles.holdBar,
                  { width: `${holdProgress * 100}%` },
                ]}
              />
            </View>
          )}

          <View style={styles.hudBottom}>
            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: hasPose
                      ? colors.success
                      : colors.error,
                  },
                ]}
              />
              <Text style={styles.statusText}>
                {hasPose ? 'Pose detected' : 'Looking...'}
              </Text>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.pauseBtn,
                {
                  backgroundColor: isTracking
                    ? 'rgba(255,255,255,0.15)'
                    : colors.primary,
                },
                pressed && { opacity: 0.75 },
              ]}
              onPress={() => {
                if (!isTracking) {
                  beginTracking();
                  return;
                }
                isTrackingRef.current = false;
                setIsTracking(false);
                setPose(null);
                setHasPose(false);
                repStateRef.current = 'rest';
                setRepState('rest');
                holdStartRef.current = null;
              }}
            >
              <Text style={styles.pauseBtnText}>
                {isTracking ? 'Pause' : 'Resume'}
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Finished overlay */}
      {finished && (
        <View style={styles.finishedOverlay}>
          <View style={styles.finishedCard}>
            <Ionicons name="checkmark-circle" size={48} color={colors.success} />
            <Text style={styles.finishedIcon}>
            </Text>
            <Text style={styles.finishedTitle}>Session complete!</Text>
            <Text style={styles.finishedSub}>
              You completed {repsCompleted} of {targetReps} reps.
            </Text>
            <Pressable style={styles.doneBtn} onPress={() => router.back()}>
              <Text style={styles.doneBtnText}>Done</Text>
            </Pressable>
          </View>
        </View>
      )}
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

  // ── Pre-start
  preStart: { flex: 1, backgroundColor: colors.background },
  preStartBack: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  preStartBackText: { color: colors.primary, fontWeight: '600', fontSize: typography.body },
  preStartContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl * 2,
    gap: spacing.lg,
  },
  preStartName: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textDark,
  },
  preStartDesc: {
    fontSize: typography.body,
    color: colors.textGrey,
    lineHeight: 22,
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoCardAccent: {
    borderColor: colors.primary + '40',
    backgroundColor: colors.primary + '08',
  },
  infoCardLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  infoCardLabel: {
    fontSize: typography.label,
    fontWeight: '700',
    color: colors.textGrey,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoCardText: {
    fontSize: typography.body,
    color: colors.textDark,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  statLabel: {
    fontSize: typography.small,
    color: colors.textGrey,
    fontWeight: '500',
  },
  notesCard: {
    backgroundColor: colors.accent + '15',
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.accent + '30',
  },
  notesLabel: {
    fontSize: typography.label,
    fontWeight: '700',
    color: colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  notesText: {
    fontSize: typography.body,
    color: colors.textDark,
    lineHeight: 22,
  },
  phaseTitle: {
    fontSize: typography.label,
    fontWeight: '700',
    color: colors.textGrey,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  phaseList: {
    gap: spacing.sm,
  },
  phaseRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  phaseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  phaseRowInfo: { flex: 1, gap: 2 },
  phaseRowLabel: {
    fontSize: typography.small,
    fontWeight: '700',
    color: colors.textDark,
  },
  phaseRowText: {
    fontSize: typography.small,
    color: colors.textGrey,
    lineHeight: 20,
  },
  preStartFooter: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  startBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  startBtnText: {
    color: colors.white,
    fontSize: typography.body,
    fontWeight: '700',
  },

  // ── Camera screen
  skeletonLine: {
    position: 'absolute',
    height: 3,
    borderRadius: 2,
    transformOrigin: 'left center',
  },
  skeletonDot: { position: 'absolute', zIndex: 10 },

  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    zIndex: 30,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  topBarBack: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '600',
  },
  topBarTitle: {
    color: colors.white,
    fontSize: typography.body,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  topBarReps: {
    color: colors.white,
    fontSize: typography.body,
    fontWeight: '700',
    minWidth: 40,
    textAlign: 'right',
  },

  // ── Countdown
  countdownOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 60,
    gap: spacing.sm,
  },
  countdownNumber: {
    fontSize: 96,
    fontWeight: '800',
    color: colors.white,
  },
  countdownHint: {
    fontSize: typography.body,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },

  // ── HUD
  hud: {
    position: 'absolute',
    bottom: 0,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: 'rgba(22,38,35,0.88)',
    borderRadius: 20,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    zIndex: 20,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  repsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  repDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  repDotDone: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  repDotActive: {
    borderColor: '#facc15',
    backgroundColor: 'rgba(250,204,21,0.15)',
  },
  hudMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  hudAngle: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.white,
    minWidth: 72,
  },
  hudInstruction: {
    flex: 1,
    fontSize: typography.body,
    fontWeight: '600',
    lineHeight: 22,
  },
  holdBarContainer: {
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  holdBar: {
    height: '100%',
    backgroundColor: '#00ff88',
    borderRadius: 3,
  },
  hudBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: {
    fontSize: typography.small,
    color: 'rgba(255,255,255,0.55)',
  },
  pauseBtn: {
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
  },
  pauseBtnText: {
    color: colors.white,
    fontSize: typography.small,
    fontWeight: '600',
  },

  // ── Finished
  finishedOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    zIndex: 50,
  },
  finishedCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.xl,
    width: '100%',
    alignItems: 'center',
    gap: spacing.md,
  },
  finishedIcon: { fontSize: 48 },
  finishedTitle: {
    fontSize: typography.subheading,
    fontWeight: '700',
    color: colors.textDark,
  },
  finishedSub: {
    fontSize: typography.body,
    color: colors.textGrey,
    textAlign: 'center',
  },
  doneBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    width: '100%',
    alignItems: 'center',
  },
  doneBtnText: {
    color: colors.white,
    fontSize: typography.body,
    fontWeight: '600',
  },
  speechRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  speechRowText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  speechLabel: {
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.textDark,
  },
});