import { radius, spacing, typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  streak: number;
  lastCompletedDate?: string;
};

export function StreakBadge({ streak, lastCompletedDate }: Props) {
  const today = new Date().toLocaleDateString('en-CA');

  const todayObj = new Date(`${today}T00:00:00`);
  todayObj.setDate(todayObj.getDate() - 1);
  const yesterday = todayObj.toLocaleDateString('en-CA');

  const isCompletedToday = lastCompletedDate === today;
  const isCompletedYesterday = lastCompletedDate === yesterday;

  if (!isCompletedToday && !isCompletedYesterday) return null;
  if (streak <= 0) return null;

  return (
    <View
      style={[
        styles.badge,
        isCompletedToday ? styles.activeBadge : styles.yesterdayBadge
      ]}
    >
      <Ionicons
        name="flame"
        size={16}
        color={isCompletedToday ? '#f97316' : '#94a3b8'}
        style={!isCompletedToday && styles.fadedFlame}
      />
      <Text
        style={[
          styles.text,
          isCompletedToday ? styles.activeText : styles.yesterdayText
        ]}
      >
        {streak}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  activeBadge: {
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
  },
  yesterdayBadge: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  fadedFlame: {
    opacity: 0.6,
  },
  text: {
    fontSize: typography.small,
    fontWeight: '700',
  },
  activeText: {
    color: '#f97316',
  },
  yesterdayText: {
    color: '#64748b',
  },
});
