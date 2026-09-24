import { colors, radius, spacing, typography } from '@/constants/theme';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type ScheduleCardProps = {
  schedule: Schedule;
  onPress?: () => void;
};

function getScheduleTimeStatus(scheduledDate?: string, graceHours = 3) {
  if (!scheduledDate) {
    return { expired: false, formattedDate: '', timeText: '' };
  }

  const [y, m, d] = scheduledDate.split('-').map(Number);
  const cutoff = new Date(y, m - 1, d, 24 + graceHours, 0, 0);
  const now = new Date();

  const formattedDate = new Date(y, m - 1, d).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const diffMs = cutoff.getTime() - now.getTime();
  if (diffMs <= 0) {
    return { expired: true, formattedDate, timeText: 'Expired' };
  }

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  let timeText = '';
  if (diffHours < 1) {
    timeText = `${diffMinutes}m left`;
  } else if (diffHours < 24) {
    timeText = `${diffHours}h left`;
  } else {
    const diffDays = Math.floor(diffHours / 24);
    timeText = `${diffDays}d left`;
  }

  return { expired: false, formattedDate, timeText };
}

export default function ScheduleCard({ schedule, onPress }: ScheduleCardProps) {
  const assignment = schedule.assignmentId;
  const exercise = assignment?.exerciseId;

  const exerciseName = exercise?.name ?? 'Exercise';
  const targetReps = assignment?.customReps ?? exercise?.targetReps ?? 0;
  const holdSeconds = assignment?.customHoldSeconds ?? exercise?.holdSeconds ?? 0;

  const completedCount = schedule.completedCount ?? 0;
  const minSessions = schedule.minSessions ?? 1;
  const maxSessions = schedule.maxSessions ?? minSessions;

  const isCompleted = completedCount >= minSessions;
  const isMaxed = completedCount >= maxSessions;

  const { expired, formattedDate, timeText } = getScheduleTimeStatus(
    schedule.scheduledDate
  );

  const isExpiredState = !isCompleted && expired;

  const badgeText = isMaxed
    ? 'Done'
    : isCompleted
      ? 'Goal Met'
      : isExpiredState
        ? 'Expired'
        : 'Pending';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.pressed,
        isCompleted && styles.completedCard,
        isExpiredState && styles.expiredCard,
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <Text style={styles.exerciseName} numberOfLines={1}>
            {exerciseName}
          </Text>
          <Text style={styles.exerciseMeta}>
            {targetReps} reps · {holdSeconds}s hold
          </Text>
          {formattedDate ? (
            <Text style={styles.dateMeta}>
              {formattedDate}
              {!isCompleted && timeText ? (
                <Text style={isExpiredState ? styles.expiredText : styles.timeText}>
                  {' · '}{timeText}
                </Text>
              ) : null}
            </Text>
          ) : null}
        </View>

        <View
          style={[
            styles.badge,
            isCompleted
              ? styles.completedBadge
              : isExpiredState
                ? styles.expiredBadge
                : styles.pendingBadge,
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              isCompleted
                ? styles.completedBadgeText
                : isExpiredState
                  ? styles.expiredBadgeText
                  : styles.pendingBadgeText,
            ]}
          >
            {badgeText}
          </Text>
        </View>
      </View>

      <View style={styles.footerRow}>
        <Text style={styles.progressText}>
          Sessions: <Text style={styles.progressHighlight}>{completedCount}</Text> / {minSessions} min ({maxSessions} max)
        </Text>
        <Text style={styles.ctaText}>
          {isMaxed ? 'Review →' : isExpiredState ? 'Catch Up →' : 'Start →'}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  pressed: {
    opacity: 0.85,
  },
  completedCard: {
    borderColor: colors.success + '40',
    backgroundColor: colors.success + '05',
  },
  expiredCard: {
    borderColor: (colors.error ?? '#EF4444') + '40',
    backgroundColor: (colors.error ?? '#EF4444') + '05',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  titleContainer: {
    flex: 1,
  },
  exerciseName: {
    fontSize: typography.body,
    fontWeight: '700',
    color: colors.textDark,
  },
  exerciseMeta: {
    fontSize: typography.small,
    color: colors.textGrey,
    marginTop: 2,
  },
  dateMeta: {
    fontSize: typography.small,
    color: colors.textGrey,
    marginTop: 2,
  },
  timeText: {
    color: colors.accent ?? '#B89B6E',
    fontWeight: '600',
  },
  expiredText: {
    color: colors.error ?? '#C0392B',
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  pendingBadge: {
    backgroundColor: colors.primary + '15',
  },
  completedBadge: {
    backgroundColor: colors.success + '20',
  },
  expiredBadge: {
    backgroundColor: (colors.error ?? '#EF4444') + '20',
  },
  badgeText: {
    fontSize: typography.small - 1,
    fontWeight: '700',
  },
  pendingBadgeText: {
    color: colors.primary,
  },
  completedBadgeText: {
    color: colors.success,
  },
  expiredBadgeText: {
    color: colors.error ?? '#EF4444',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border + '60',
  },
  progressText: {
    fontSize: typography.small,
    color: colors.textGrey,
  },
  progressHighlight: {
    fontWeight: '700',
    color: colors.textDark,
  },
  ctaText: {
    fontSize: typography.small,
    fontWeight: '700',
    color: colors.primary,
  },
});