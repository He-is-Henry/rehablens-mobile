import { colors, radius, spacing, typography } from '@/constants/theme';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

type Props = {
  hospitals: LeaderboardHospital[];
  selectedId: string | null;
  onSelect(id: string): void;
};

export function HospitalTabs({ hospitals, selectedId, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.wrap}
    >
      {hospitals.map((h) => {
        const isSelected = h.hospitalId === selectedId;
        return (
          <Pressable
            key={h.hospitalId}
            style={[styles.pill, isSelected && styles.pillActive]}
            onPress={() => onSelect(h.hospitalId)}
          >
            <Text style={[styles.text, isSelected && styles.textActive]}>
              {h.hospitalName}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    backgroundColor: colors.border + '40',
  },
  pillActive: { backgroundColor: colors.primary },
  text: {
    fontSize: typography.small,
    fontWeight: '600',
    color: colors.textGrey,
  },
  textActive: { color: colors.white },
});