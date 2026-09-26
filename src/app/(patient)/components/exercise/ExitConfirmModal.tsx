import { colors, radius, spacing, typography } from '@/constants/theme';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  visible: boolean;
  repsCompleted: number;
  targetReps: number;
  onSaveAndExit: () => void;
  onExitWithoutSaving: () => void;
  onCancel: () => void;
};

export function ExitConfirmModal({
  visible,
  repsCompleted,
  targetReps,
  onSaveAndExit,
  onExitWithoutSaving,
  onCancel,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable style={styles.card} onPress={() => { }}>
          <Text style={styles.title}>Leave session?</Text>
          <Text style={styles.sub}>
            You've completed {repsCompleted} of {targetReps} reps. Your progress won't count toward your streak unless you finish.
          </Text>

          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [styles.btn, styles.saveBtn, pressed && { opacity: 0.85 }]}
              onPress={onSaveAndExit}
            >
              <Text style={styles.saveBtnText}>Save progress & exit</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.btn, styles.discardBtn, pressed && { opacity: 0.85 }]}
              onPress={onExitWithoutSaving}
            >
              <Text style={styles.discardBtnText}>Exit without saving</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.btn, styles.cancelBtn, pressed && { opacity: 0.7 }]}
              onPress={onCancel}
            >
              <Text style={styles.cancelBtnText}>Keep going</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.xl,
    width: '100%',
    gap: spacing.md,
  },
  title: {
    fontSize: typography.subheading,
    fontWeight: '700',
    color: colors.textDark,
  },
  sub: {
    fontSize: typography.body,
    color: colors.textGrey,
    lineHeight: 22,
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  btn: {
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  saveBtn: {
    backgroundColor: colors.primary,
  },
  saveBtnText: {
    color: colors.white,
    fontSize: typography.body,
    fontWeight: '600',
  },
  discardBtn: {
    backgroundColor: colors.error + '12',
    borderWidth: 1,
    borderColor: colors.error + '30',
  },
  discardBtnText: {
    color: colors.error,
    fontSize: typography.body,
    fontWeight: '600',
  },
  cancelBtn: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelBtnText: {
    color: colors.textDark,
    fontSize: typography.body,
    fontWeight: '500',
  },
});