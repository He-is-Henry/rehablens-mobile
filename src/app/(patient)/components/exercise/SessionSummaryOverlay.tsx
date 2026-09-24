import { colors, radius, spacing, typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  visible: boolean;
  exerciseName: string;
  repsCompleted: number;
  targetReps: number;
  durationSeconds: number;
  pointsAwarded: number;
  onContinue: () => void;
};

export function SessionSummaryOverlay({
  visible,
  exerciseName,
  repsCompleted,
  targetReps,
  durationSeconds,
  pointsAwarded,
  onContinue,
}: Props) {
  const insets = useSafeAreaInsets();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    if (visible) {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.85);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  return (
    <Modal visible={visible} animationType="none" transparent statusBarTranslucent>
      <Animated.View
        style={[
          styles.container,
          { opacity: fadeAnim, paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.iconCircle}>
            <Ionicons name="trophy" size={44} color={colors.primary} />
          </View>

          <Text style={styles.title}>Workout Completed!</Text>
          <Text style={styles.exerciseName}>{exerciseName}</Text>

          {/* Metrics Grid */}
          <View style={styles.grid}>
            <View style={styles.statBox}>
              <Ionicons name="repeat" size={20} color={colors.primary} />
              <Text style={styles.statVal}>
                {repsCompleted}/{targetReps}
              </Text>
              <Text style={styles.statLbl}>Reps</Text>
            </View>

            <View style={styles.statBox}>
              <Ionicons name="time-outline" size={20} color={colors.primary} />
              <Text style={styles.statVal}>{formatDuration(durationSeconds)}</Text>
              <Text style={styles.statLbl}>Duration</Text>
            </View>

            <View style={styles.statBox}>
              <Ionicons name="star" size={20} color="#facc15" />
              <Text style={[styles.statVal, { color: '#facc15' }]}>
                +{pointsAwarded}
              </Text>
              <Text style={styles.statLbl}>Points</Text>
            </View>
          </View>

          <Pressable style={styles.button} onPress={onContinue}>
            <Text style={styles.buttonText}>Continue</Text>
            <Ionicons name="arrow-forward" size={18} color="#000" />
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    backgroundColor: '#162623',
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 255, 136, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.subheading + 4,
    fontWeight: '800',
    color: colors.white,
  },
  exerciseName: {
    fontSize: typography.body,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
    marginBottom: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
    marginBottom: spacing.xl,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.md,
    alignItems: 'center',
    gap: 4,
  },
  statVal: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
  statLbl: {
    fontSize: typography.small - 1,
    color: 'rgba(255,255,255,0.5)',
  },
  button: {
    width: '100%',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  buttonText: {
    fontSize: typography.body,
    fontWeight: '700',
    color: '#000',
  },
});