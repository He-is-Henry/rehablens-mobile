import { colors, radius, spacing, typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  visible: boolean;
  previousRank: string;
  newRank: string;
  onClose: () => void;
};

export function RankUpModal({ visible, previousRank, newRank, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Ionicons name="trending-up" size={40} color={colors.white} />
          </View>
          
          <Text style={styles.title}>Rank Up! 🚀</Text>
          <Text style={styles.sub}>You are climbing the leaderboard!</Text>

          <View style={styles.comparisonRow}>
            <View style={styles.rankBox}>
              <Text style={styles.rankLabel}>Previous</Text>
              <Text style={styles.rankNumOld}>#{previousRank}</Text>
            </View>
            
            <Ionicons name="arrow-forward" size={24} color={colors.textGrey} />

            <View style={styles.rankBox}>
              <Text style={styles.rankLabel}>New Rank</Text>
              <Text style={styles.rankNumNew}>#{newRank}</Text>
            </View>
          </View>

          <Pressable 
            style={({ pressed }) => [styles.btn, pressed && { opacity: 0.9 }]} 
            onPress={onClose}
          >
            <Text style={styles.btnText}>Let's go!</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.xl,
    width: '100%',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.subheading,
    fontWeight: '700',
    color: colors.textDark,
  },
  sub: {
    fontSize: typography.body,
    color: colors.textGrey,
    textAlign: 'center',
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    marginVertical: spacing.md,
  },
  rankBox: {
    alignItems: 'center',
    gap: 4,
  },
  rankLabel: {
    fontSize: typography.small,
    color: colors.textGrey,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rankNumOld: {
    fontSize: typography.subheading,
    fontWeight: '600',
    color: colors.textGrey,
  },
  rankNumNew: {
    fontSize: typography.heading,
    fontWeight: '800',
    color: colors.primary,
  },
  btn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.full,
    width: '100%',
    alignItems: 'center',
  },
  btnText: {
    color: colors.white,
    fontSize: typography.body,
    fontWeight: '700',
  },
});
