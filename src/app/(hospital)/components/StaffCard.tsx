import { colors, radius, spacing, typography } from '@/constants/theme';
import { StyleSheet, Text, View } from 'react-native';


type Props = {
  item: User;
}
export default function StaffCard({ item }: Props) {
  return <View style={styles.card}>
    <View style={styles.cardLeft}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.name[0]}</Text>
      </View>
      <View>
        <Text style={styles.cardName}>{item.name}</Text>
        <Text style={styles.cardSub}>{item.customId} · {item.email}</Text>
      </View>
    </View>
    <View style={[styles.pill, item.isActive ? styles.pillActive : styles.pillInactive]}>
      <Text style={[styles.pillText, item.isActive ? styles.pillTextActive : styles.pillTextInactive]}>
        {item.isActive ? 'Active' : 'Inactive'}
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
})