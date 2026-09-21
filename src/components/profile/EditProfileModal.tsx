import { colors, radius, spacing, typography } from '@/constants/theme';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Toast from 'react-native-toast-message';

type EditProfileModalProps = {
  visible: boolean;
  formData: EditProfilePayload;
  saving: boolean;
  onClose: () => void;
  onChangeFormData: (field: 'name' | 'email', value: string) => void;
  onSave: () => void;
};

export default function EditProfileModal({
  visible,
  formData,
  saving,
  onClose,
  onChangeFormData,
  onSave,
}: EditProfileModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modal} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.modalTitle}>Edit Profile</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Name</Text>
            <TextInput
              style={styles.textInput}
              value={formData.name}
              onChangeText={(text) => onChangeFormData('name', text)}
              placeholder="Enter name"
              placeholderTextColor={colors.textGrey}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.textInput}
              value={formData.email}
              onChangeText={(text) => onChangeFormData('email', text)}
              placeholder="Enter email"
              placeholderTextColor={colors.textGrey}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.modalActions}>
            <Pressable
              style={({ pressed }) => [styles.modalCancel, pressed && { opacity: 0.7 }]}
              onPress={onClose}
              disabled={saving}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.saveButton, pressed && { opacity: 0.85 }]}
              onPress={onSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
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
