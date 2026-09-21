import React from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { colors, radius, spacing, typography } from '@/constants/theme';

type LogoutModalProps = {
  visible: boolean;
  loggingOut: boolean;
  onClose: () => void;
  onLogout: () => void;
};

export default function LogoutModal({ visible, loggingOut, onClose, onLogout }: LogoutModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modal} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.modalTitle}>Sign out?</Text>
          <Text style={styles.modalSub}>
            You'll need to log back in to access your account.
          </Text>
          <View style={styles.modalActions}>
            <Pressable
              style={({ pressed }) => [styles.modalCancel, pressed && { opacity: 0.7 }]}
              onPress={onClose}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.modalConfirm, pressed && { opacity: 0.85 }]}
              onPress={onLogout}
              disabled={loggingOut}
            >
              {loggingOut ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={styles.modalConfirmText}>Sign out</Text>
              )}
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
      <Toast />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modal: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.xl,
    width: '100%',
    gap: spacing.md,
  },
  modalTitle: {
    fontSize: typography.subheading,
    fontWeight: '700',
    color: colors.textDark,
  },
  modalSub: {
    fontSize: typography.body,
    color: colors.textGrey,
    lineHeight: 22,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  modalCancel: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalCancelText: {
    fontSize: typography.body,
    color: colors.textDark,
    fontWeight: '500',
  },
  modalConfirm: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.error,
  },
  modalConfirmText: {
    fontSize: typography.body,
    color: colors.white,
    fontWeight: '600',
  },
});
