import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '@/constants/theme';

type Props = {
  exerciseName: string;
  repsCompleted: number;
  targetReps: number;
  onBackPress: () => void;
};

export function ExerciseTopBar({
  exerciseName,
  repsCompleted,
  targetReps,
  onBackPress,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.topBar, { paddingTop: insets.top + spacing.xs }]}>
      <Pressable
        style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
        onPress={onBackPress}
        hitSlop={8}
      >
        <Ionicons name="chevron-back" size={24} color={colors.white} />
      </Pressable>

      <Text style={styles.title} numberOfLines={1}>
        {exerciseName}
      </Text>

      <View style={styles.badge}>
        <Text style={styles.badgeText}>
          {repsCompleted} / {targetReps}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    zIndex: 30,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontSize: typography.body,
    fontWeight: '700',
    color: colors.white,
    marginHorizontal: spacing.sm,
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: colors.white,
    fontSize: typography.small,
    fontWeight: '700',
  },
});