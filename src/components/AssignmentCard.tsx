import { colors, radius, spacing, typography } from '@/constants/theme';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  assignment: Assignment;
  onPress?: () => void;
  showPatient?: boolean;
};

const statusColor: Record<AssignmentStatus, { bg: string; text: string }> = {
  active: {
    bg: colors.success + '18',
    text: colors.success
  },
  completed: {
    bg: colors.primary + '18',
    text: colors.primary
  },
  paused: {
    bg: colors.accent + '25',
    text: colors.accent
  },
  archived: {
    bg: colors.textGrey + '18',
    text: colors.textGrey
  },
};

export default function AssignmentCard({ assignment, onPress, showPatient }: Props) {
  const s = statusColor[assignment.status];
  const targetReps = assignment.customReps ?? assignment.exerciseId.targetReps;

  const cardStyle = ({ pressed }: { pressed: boolean }) => [
    styles.card,
    pressed && { opacity: 0.85 },
  ];

  const content = (
    <>
      <View style={styles.row}>
        <Text style={styles.name} numberOfLines={1}>{assignment.exerciseId.name}</Text>
        <View style={[styles.badge, { backgroundColor: s.bg }]}>
          <Text style={[styles.badgeText, { color: s.text }]}>{assignment.status}</Text>
        </View>
      </View>

      {showPatient && assignment.patientId && (
        <Text style={styles.meta}>{assignment.patientId.name} · {assignment.patientId.customId}</Text>
      )}

      <Text style={styles.meta}>{targetReps} reps</Text>

      {assignment.notes && (
        <Text style={styles.notes} numberOfLines={2}>{assignment.notes}</Text>
      )}
    </>
  );

  return onPress ? (
    <Pressable style={cardStyle} onPress={onPress}>{content}</Pressable>
  ) : (
    <View style={styles.card}>{content}</View>
  );
}


const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  name: {
    fontSize: typography.body,
    fontWeight: '700',
    color: colors.textDark,
    flex: 1,
    flexWrap: 'wrap',
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  badgeText: {
    fontSize: typography.label,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  meta: {
    fontSize: typography.small,
    color: colors.textGrey,
  },
  notes: {
    fontSize: typography.small,
    color: colors.textGrey,
    fontStyle: 'italic',
  },

});