import { colors, radius, spacing, typography } from '@/constants/theme';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  countdown: number | null;
  targetReps: number;
  repsCompleted: number;
  primaryAngle: number | null;
  repState: RepState;
  currentInstruction: string;
  holdProgress: number;
  hasPose: boolean;
  isTracking: boolean;
  repStateColor: Record<RepState, string>;
  onTogglePause(): void;
};

export function ExerciseHUD({
  countdown,
  targetReps,
  repsCompleted,
  primaryAngle,
  repState,
  currentInstruction,
  holdProgress,
  hasPose,
  isTracking,
  repStateColor,
  onTogglePause,
}: Props) {
  const insets = useSafeAreaInsets();

  if (countdown !== null) {
    return (
      <View style={styles.countdownOverlay}>
        <Text style={styles.countdownNumber}>
          {countdown === 0 ? 'Go!' : countdown}
        </Text>
        <Text style={styles.countdownHint}>Get into position</Text>
      </View>
    );
  }

  return (
    <View style={[styles.hud, { paddingBottom: insets.bottom + spacing.sm }]}>
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
        {typeof primaryAngle === 'number' && !isNaN(primaryAngle) ? (
          <Text style={styles.hudAngle}>{Math.round(primaryAngle)}°</Text>
        ) : (
          <Text style={styles.hudAngle}>--°</Text>
        )}
        <Text
          style={[styles.hudInstruction, { color: repStateColor[repState] }]}
          numberOfLines={2}
        >
          {currentInstruction}
        </Text>
      </View>

      {repState === 'holding' && (
        <View style={styles.holdBarContainer}>
          <View
            style={[styles.holdBar, { width: `${holdProgress * 100}%` }]}
          />
        </View>
      )}

      <View style={styles.hudBottom}>
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: hasPose ? colors.success : colors.error },
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
          onPress={onTogglePause}
        >
          <Text style={styles.pauseBtnText}>
            {isTracking ? 'Pause' : 'Resume'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
});