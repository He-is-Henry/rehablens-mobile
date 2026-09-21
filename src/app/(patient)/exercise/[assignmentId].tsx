import { Camera as PoseCamera } from '@scottjgilroy/react-native-vision-camera-v4-pose-detection';
import { router, useLocalSearchParams } from 'expo-router';
import * as Speech from 'expo-speech';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import {
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';

import { colors } from '@/constants/theme';
import { useAuth } from '@/context/auth.context';
import { createSessionResult } from '@/lib/patient';
import { usePatientQuery } from '@/queries/patient';

import { ExerciseHUD } from '../components/exercise/ExerciseHUD';
import { ExerciseTopBar } from '../components/exercise/ExerciseTopBar';
import { PreStartScreen } from '../components/exercise/PreStartScreen';
import { SkeletonOverlay } from '../components/exercise/SkeletonOverlay';
import {
  FRAME_H,
  FRAME_W,
  getAngle,
  meetsAllOrAny,
} from '../components/exercise/exerciseMath';

const Camera = PoseCamera as any;

const repStateColor: Record<RepState, string> = {
  rest: '#ffffff',
  triggered: '#facc15',
  holding: '#00ff88',
  returning: '#60a5fa',
};

export default function ExerciseScreen() {
  const { assignmentId } = useLocalSearchParams<{ assignmentId: string }>();
  const { data: assignment, loading: loadingAssignment } =
    usePatientQuery.assignmentById(assignmentId);
  const { requireStorage } = useAuth();
  const storage = requireStorage();

  const exercise = assignment?.exerciseId!;
  const targetReps = assignment?.customReps ?? exercise?.targetReps!;
  const holdSeconds = assignment?.customHoldSeconds ?? exercise?.holdSeconds!;

  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('front');
  const { width: W, height: H } = useWindowDimensions();

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

  useEffect(() => {
    if (!hasPermission) requestPermission();
  }, [hasPermission, requestPermission]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isTrackingRef.current) {
        setHasPose(false);
        return;
      }
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
    return () => clearInterval(timer);
  }, [countdown]);

  useEffect(() => {
    storage.get('speechEnabled').then((val) => {
      if (val) {
        const { data } = val;
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
    return () => {
      Speech.stop();
    };
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
  const currentInstruction = isTracking
    ? exercise.repStateInstructions[repState]
    : 'Paused';

  const handleBackPress = () => {
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
  };

  const handleTogglePause = () => {
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
  };

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

      {isTracking && pose && (
        <SkeletonOverlay
          pose={pose}
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
      />

      <ExerciseHUD
        countdown={countdown}
        finished={finished}
        targetReps={targetReps}
        repsCompleted={repsCompleted}
        primaryAngle={primaryAngle}
        repState={repState}
        currentInstruction={currentInstruction}
        holdProgress={holdProgress}
        hasPose={hasPose}
        isTracking={isTracking}
        repStateColor={repStateColor}
        onTogglePause={handleTogglePause}
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