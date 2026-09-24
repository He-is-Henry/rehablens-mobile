import { colors, radius, spacing, typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MediaViewer } from './MediaViewer';


type Props = {
  assignment: Assignment;
  schedule?: Schedule;
  speechEnabled: boolean;
  onToggleSpeech: () => void;
  onStart: () => void;
};

function getScheduleStartStatus(assignment: Assignment, schedule?: Schedule) {
  if (assignment?.status !== 'active') {
    return {
      canStart: false,
      reason: `This assignment is currently ${assignment?.status ?? 'inactive'}.`,
    };
  }

  if (schedule) {
    if ((schedule.completedCount ?? 0) >= schedule.maxSessions) {
      return {
        canStart: false,
        reason: 'This session has already been completed.',
      };
    }
  }

  if (!schedule?.scheduledDate) {
    return { canStart: true, reason: null };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [year, month, day] = schedule.scheduledDate.split('-').map(Number);

  const schedDay = new Date(year, month - 1, day);

  const diffDays = Math.round((schedDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays > 0) {
    const formattedDate = schedDay.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    return {
      canStart: false,
      reason: `Scheduled for ${diffDays === 1 ? 'tomorrow' : formattedDate}. You can review instructions now.`,
    };
  }

  if (diffDays < 0) {
    return {
      canStart: false,
      reason: 'This session date has passed. Please check with your provider for an updated schedule.',
    };
  }

  return { canStart: true, reason: null };
}

export function PreStartScreen({
  assignment,
  schedule,
  speechEnabled,
  onToggleSpeech,
  onStart,
}: Props) {
  const insets = useSafeAreaInsets();
  const exercise = assignment?.exerciseId;
  const targetReps = assignment?.customReps ?? exercise?.targetReps ?? 10;
  const holdSeconds = assignment?.customHoldSeconds ?? exercise?.holdSeconds ?? 0;

  const { canStart, reason } = getScheduleStartStatus(assignment, schedule);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.closeBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Exercise Overview</Text>
        <Pressable style={styles.speechBtn} onPress={onToggleSpeech}>
          <Ionicons
            name={speechEnabled ? 'volume-high' : 'volume-mute'}
            size={22}
            color={speechEnabled ? colors.primary : 'rgba(255,255,255,0.4)'}
          />
        </Pressable>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>{exercise?.name ?? 'Exercise'}</Text>
        {exercise?.description ? (
          <Text style={styles.description}>{exercise.description}</Text>
        ) : null}

        {/* Stats Summary */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{targetReps}</Text>
            <Text style={styles.statLbl}>Target Reps</Text>
          </View>
          {holdSeconds > 0 && (
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{holdSeconds}s</Text>
              <Text style={styles.statLbl}>Hold Duration</Text>
            </View>
          )}
        </View>

        {/* Camera Orientation Tip */}
        {exercise?.cameraOrientationTip && (
          <View style={styles.tipCard}>
            <Ionicons name="camera-outline" size={20} color={colors.primary} />
            <Text style={styles.tipText}>{exercise.cameraOrientationTip}</Text>
          </View>
        )}

        {/* Exercise Media */}
        <MediaViewer media={exercise?.media} />

        {/* Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          <Text style={styles.instructionsText}>
            {exercise?.instructions ||
              exercise?.repStateInstructions?.rest ||
              'Align your body in full view of the camera before starting.'}
          </Text>
        </View>
      </ScrollView>

      {/* Footer Action */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        {canStart ? (
          <Pressable style={styles.startBtn} onPress={onStart}>
            <Ionicons name="play" size={20} color="#000" style={{ marginRight: 6 }} />
            <Text style={styles.startBtnText}>Start Exercise</Text>
          </Pressable>
        ) : (
          <View style={styles.blockedNotice}>
            <Ionicons name="time-outline" size={20} color="rgba(255,255,255,0.7)" />
            <Text style={styles.blockedText}>{reason}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    height: 56,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.white,
  },
  speechBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: { flex: 1 },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.white,
  },
  description: {
    fontSize: typography.body,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
  statLbl: {
    fontSize: typography.small,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(0, 255, 136, 0.08)',
    borderColor: 'rgba(0, 255, 136, 0.2)',
    borderWidth: 1,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  tipText: {
    flex: 1,
    color: colors.white,
    fontSize: typography.small,
    lineHeight: 18,
  },
  section: {
    gap: spacing.xs,
  },
  sectionTitle: {
    fontSize: typography.subheading,
    fontWeight: '700',
    color: colors.white,
  },
  instructionsText: {
    fontSize: typography.body,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  startBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startBtnText: {
    fontSize: typography.body,
    fontWeight: '700',
    color: '#000',
  },
  blockedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.06)',
    padding: spacing.md,
    borderRadius: radius.lg,
  },
  blockedText: {
    flex: 1,
    color: 'rgba(255,255,255,0.7)',
    fontSize: typography.small,
    lineHeight: 18,
  },
});