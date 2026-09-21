import React, { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '@/constants/theme';

type ChangePasswordModalProps = {
  visible: boolean;
  passwordData: { currentPassword: string; newPassword: string; confirmPassword: string };
  savingPassword: boolean;
  onClose: () => void;
  onChangePasswordData: (field: string, value: string) => void;
  onSubmit: () => void;
};

export default function ChangePasswordModal({
  visible,
  passwordData,
  savingPassword,
  onClose,
  onChangePasswordData,
  onSubmit,
}: ChangePasswordModalProps) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modal} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.modalTitle}>Change Password</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Current Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.textInput, styles.passwordInput]}
                value={passwordData.currentPassword}
                onChangeText={(text) => onChangePasswordData('currentPassword', text)}
                placeholder="Enter current password"
                placeholderTextColor={colors.textGrey}
                secureTextEntry={!showCurrentPassword}
              />
              <Pressable style={styles.eyeBtn} onPress={() => setShowCurrentPassword((p) => !p)}>
                <Ionicons name={showCurrentPassword ? 'eye-off' : 'eye'} size={20} color={colors.textGrey} />
              </Pressable>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>New Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.textInput, styles.passwordInput]}
                value={passwordData.newPassword}
                onChangeText={(text) => onChangePasswordData('newPassword', text)}
                placeholder="Enter new password"
                placeholderTextColor={colors.textGrey}
                secureTextEntry={!showNewPassword}
              />
              <Pressable style={styles.eyeBtn} onPress={() => setShowNewPassword((p) => !p)}>
                <Ionicons name={showNewPassword ? 'eye-off' : 'eye'} size={20} color={colors.textGrey} />
              </Pressable>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Confirm Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.textInput, styles.passwordInput]}
                value={passwordData.confirmPassword}
                onChangeText={(text) => onChangePasswordData('confirmPassword', text)}
                placeholder="Re-enter new password"
                placeholderTextColor={colors.textGrey}
                secureTextEntry={!showConfirmPassword}
              />
              <Pressable style={styles.eyeBtn} onPress={() => setShowConfirmPassword((p) => !p)}>
                <Ionicons name={showConfirmPassword ? 'eye-off' : 'eye'} size={20} color={colors.textGrey} />
              </Pressable>
            </View>
          </View>

          <View style={styles.modalActions}>
            <Pressable
              style={({ pressed }) => [styles.modalCancel, pressed && { opacity: 0.7 }]}
              onPress={onClose}
              disabled={savingPassword}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.saveButton, pressed && { opacity: 0.85 }]}
              onPress={onSubmit}
              disabled={savingPassword}
            >
              {savingPassword ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={styles.saveButtonText}>Update</Text>
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
  inputGroup: {
    gap: spacing.xs,
  },
  inputLabel: {
    fontSize: typography.small,
    color: colors.textGrey,
    fontWeight: '600',
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.body,
    color: colors.textDark,
    backgroundColor: colors.background,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    borderRightWidth: 0,
  },
  eyeBtn: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopRightRadius: radius.md,
    borderBottomRightRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  saveButton: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    fontSize: typography.body,
    color: colors.white,
    fontWeight: '600',
  },
});
