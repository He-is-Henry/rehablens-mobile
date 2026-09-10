import { colors, spacing, typography } from "@/constants/theme";
import { StyleSheet, Text, View } from "react-native";

export default function EmptyState({ label, sub }: { label: string; sub: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyLabel}>{label}</Text>
      <Text style={styles.emptySub}>{sub}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
    gap: spacing.xs,
  },
  emptyLabel: {
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.textDark,
  },
  emptySub: {
    fontSize: typography.small,
    color: colors.textGrey,
  },
})