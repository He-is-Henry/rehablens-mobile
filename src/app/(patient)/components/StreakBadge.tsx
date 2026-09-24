import { radius, spacing, typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  streak: number;
};

export function StreakBadge({ streak }: Props) {
  if (streak <= 0) return null;

  return (
    <View style={styles.badge}>
      <Ionicons name="flame" size={16} color="#f97316" />
      <Text style={styles.text}>{streak}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: typography.small,
    fontWeight: '700',
    color: '#f97316',
  },
});