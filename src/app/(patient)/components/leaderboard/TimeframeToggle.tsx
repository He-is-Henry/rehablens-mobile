import { colors, radius, spacing, typography } from '@/constants/theme';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  lifetime: boolean;
  onChange(lifetime: boolean): void;
};

export function TimeframeToggle({ lifetime, onChange }: Props) {
  return (
    <View style={styles.wrap}>
      <Pressable
        style={[styles.tab, !lifetime && styles.tabActive]}
        onPress={() => onChange(false)}
      >
        <Text style={[styles.text, !lifetime && styles.textActive]}>Weekly</Text>
      </Pressable>
      <Pressable
        style={[styles.tab, lifetime && styles.tabActive]}
        onPress={() => onChange(true)}
      >
        <Text style={[styles.text, lifetime && styles.textActive]}>Lifetime</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: colors.border + '40',
    borderRadius: radius.md,
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.xs + 2,
    alignItems: 'center',
    borderRadius: radius.sm,
  },
  tabActive: { backgroundColor: colors.white },
  text: {
    fontSize: typography.small,
    fontWeight: '600',
    color: colors.textGrey,
  },
  textActive: { color: colors.primary },
});