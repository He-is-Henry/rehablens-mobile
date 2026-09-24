import { colors, radius, spacing, typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

type LeaderboardEntry = {
  patientId: string;
  name: string;
  customId: string;
  points: number;
};

type Props = {
  entry: LeaderboardEntry;
  rank: number;
  isSelf: boolean;
};

const medalColors: Record<number, string> = {
  1: '#facc15',
  2: '#cbd5e1',
  3: '#f97316',
};

export function LeaderboardRow({ entry, rank, isSelf }: Props) {
  const medalColor = medalColors[rank];

  return (
    <View style={[styles.row, isSelf && styles.rowSelf]}>
      <View style={styles.rankWrap}>
        {medalColor ? (
          <View style={styles.medalContainer}>
            <Ionicons name="medal" size={20} color={medalColor} />
            <Text style={styles.rankTextBelow}>{rank}</Text>
          </View>
        ) : (
          <Text style={styles.rankText}>{rank}</Text>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {entry.name}
          {isSelf ? ' (You)' : ''}
        </Text>
        <Text style={styles.customId}>{entry.customId}</Text>
      </View>

      <Text style={styles.points}>{entry.points}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  rowSelf: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '08',
  },
  rankWrap: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medalContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankTextBelow: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textGrey,
    marginTop: -2,
  },
  rankText: {
    fontSize: typography.body,
    fontWeight: '700',
    color: colors.textGrey,
  },
  info: {
    flex: 1,
    gap: 2
  },
  name: {
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.textDark,
  },
  customId: {
    fontSize: typography.small,
    color: colors.textGrey,
  },
  points: {
    fontSize: typography.subheading,
    fontWeight: '700',
    color: colors.primary,
  },
});
