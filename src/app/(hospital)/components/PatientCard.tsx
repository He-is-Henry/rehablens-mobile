import { colors, radius, spacing, typography } from "@/constants/theme";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  item: Link
}

export default function PatientCard({ item }: Props) {
  return <View style={styles.card}>
    <View style={styles.cardLeft}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.patientId.name[0]}</Text>
      </View>
      <View>
        <Text style={styles.cardName}>{item.patientId.name}</Text>
        <Text style={styles.cardSub}>{item.patientId.customId} · {item.patientId.email}</Text>
        {item.staffId
          ? <Text style={styles.cardSub}>{item.staffId.name}</Text>
          : <Text style={styles.unassigned}>Unassigned</Text>
        }
      </View>
    </View>
    <View style={[styles.pill, item.verified ? styles.pillActive : styles.pillPending]}>
      <Text style={[styles.pillText, item.verified ? styles.pillTextActive : styles.pillTextPending]}>
        {item.verified ? 'Verified' : 'Pending'}
      </Text>
    </View>
  </View>
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: typography.body,
    fontWeight: '700',
    color: colors.primary,
  },
  cardName: {
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.textDark,
  },
  cardSub: {
    fontSize: typography.small,
    color: colors.textGrey,
    marginTop: 2,
  },
  unassigned: {
    fontSize: typography.small,
    color: colors.accent,
    fontStyle: 'italic',
    marginTop: 2,
  },
  pill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  pillActive: {
    backgroundColor: colors.success + '18',
  },
  pillInactive: {
    backgroundColor: colors.textGrey + '18',
  },
  pillPending: {
    backgroundColor: colors.accent + '25',
  },
  pillText: {
    fontSize: typography.label,
    fontWeight: '600',
  },
  pillTextActive: {
    color: colors.success,
  },
  pillTextInactive: {
    color: colors.textGrey,
  },
  pillTextPending: {
    color: colors.accent,
  },
})