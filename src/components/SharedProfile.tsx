import { colors, radius, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/context/auth.context';
import { useRefresh } from '@/hooks/useRefresh';
import { changePassword, logout, revokeAllSessions, revokeSession } from '@/lib/auth';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ReactNode, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import SessionList from './SessionList';

type Props = {
  extra?: ReactNode;
};

export default function SharedProfile({ extra }: Props) {
  const { user, clearAuth, sessions, setSessionsData, editProfile, fetchCurrentUser, deleteAccount } = useAuth();
  const insets = useSafeAreaInsets();

  const [loggingOut, setLoggingOut] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Edit Profile States
  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<EditProfilePayload>({
    name: '',
    email: '',
  });

  // Change Password States
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Password Visibility States
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { refreshing, onRefreshControl } = useRefresh(fetchCurrentUser)


  const roleLabel: Record<string, string> = {
    hospital_admin: 'Hospital Administrator',
    staff: 'Staff',
    patient: 'Patient',
    admin: 'Super Admin',
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      await clearAuth();
      router.replace('/(auth)/login');
    } catch {
      setLoggingOut(false);
      setShowConfirm(false);
      Toast.show({ type: 'error', text1: 'Logout failed', text2: 'Please try again' });
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteAccount();
      setShowDeleteConfirm(false);
      Toast.show({
        type: 'info',
        text1: 'Account scheduled for deletion',
        text2: 'You have 7 days to log back in and recover it.',
      });
      router.replace('/(auth)/login');
    } catch (e: any) {
      Toast.show({
        type: 'error',
        text1: 'Deletion failed',
        text2: e?.message ?? 'Could not delete account',
      });
    } finally {
      setDeleting(false);
    }
  };

  const openEditModal = () => {
    setFormData({
      name: user?.name ?? '',
      email: user?.email ?? '',
    });
    setShowEditModal(true);
  };

  const openPasswordModal = () => {
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setShowPasswordModal(true);
  };

  const handleSaveProfile = async () => {
    if (!formData.name?.trim() || !formData.email?.trim()) {
      Toast.show({ type: 'error', text1: 'Validation Error', text2: 'Name and Email are required' });
      return;
    }

    setSaving(true);
    try {
      await editProfile(formData);
      setShowEditModal(false);
      Toast.show({ type: 'success', text1: 'Profile updated successfully' });
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Update failed', text2: e?.message ? e.message : 'Could not update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      Toast.show({ type: 'error', text1: 'Validation Error', text2: 'All fields are required' });
      return;
    }

    if (newPassword !== confirmPassword) {
      Toast.show({ type: 'error', text1: 'Validation Error', text2: 'New passwords do not match' });
      return;
    }

    if (newPassword.length < 8) {
      Toast.show({ type: 'error', text1: 'Validation Error', text2: 'Password must be at least 8 characters' });
      return;
    }

    setSavingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      setShowPasswordModal(false);
      Toast.show({ type: 'success', text1: 'Password changed successfully' });
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Change Password Failed', text2: e?.message ? e.message : 'Could not change password' });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefreshControl} />}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + spacing.lg }]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() ?? '?'}</Text>
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.role}>{roleLabel[user?.role ?? ''] ?? user?.role}</Text>
          <View style={styles.idBadge}>
            <Text style={styles.idText}>{user?.customId}</Text>
          </View>
        </View>

        {/* Account section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Account</Text>
            <Pressable onPress={openEditModal} hitSlop={8}>
              <Text style={styles.editAction}>Edit Profile</Text>
            </Pressable>
          </View>
          <View style={styles.card}>
            <InfoRow label="Name" value={user?.name ?? '—'} />
            <Divider />
            <InfoRow label="Email" value={user?.email ?? '—'} />
            <Divider />
            <InfoRow
              label="Status"
              value={user?.isActive ? 'Active' : 'Inactive'}
              valueColor={user?.isActive ? colors.success : colors.error}
            />
            <Divider />
            <Pressable style={styles.infoRow} onPress={openPasswordModal}>
              <Text style={styles.infoLabel}>Password</Text>
              <Text style={[styles.infoValue, { color: colors.primary }]}>
                Change Password →
              </Text>
            </Pressable>

            {/* {__DEV__ && (
              <>
                <Divider />
                <Link
                  href={{
                    pathname: '/(patient)/exercise/[assignmentId]',
                    params: { assignmentId: 'demo123' },
                  }}
                  asChild
                >
                  <Pressable style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: '#e67e22', fontWeight: '700' }]}>
                      Developer Mode
                    </Text>
                    <Text style={[styles.infoValue, { color: colors.textGrey }]}>
                      Test an exercise →
                    </Text>
                  </Pressable>
                </Link>
              </>
            )} */}

            <Pressable
              style={styles.infoRow}
              onPress={() => router.push("/reminders")}
            >
              <Text style={styles.infoLabel}>Reminders</Text>
              <Text style={[styles.infoValue, { color: colors.primary }]}>
                Manage reminders →
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Role-specific extra content */}
        {extra}

        {/* Sessions */}
        <View style={styles.section}>
          <SessionList
            sessions={sessions}
            onRevoke={async (id) => {
              await revokeSession(id);
              setSessionsData(sessions.filter((s) => s._id !== id));
              Toast.show({ type: 'success', text1: 'Session removed' });
            }}
            onRevokeAll={async () => {
              await revokeAllSessions();
              setSessionsData(sessions.filter((s) => s.currentDevice));
              Toast.show({ type: 'success', text1: 'All other sessions removed' });
            }}
          />
        </View>

        {/* Sign out */}
        <View style={styles.section}>
          <Pressable
            style={({ pressed }) => [styles.logoutButton, pressed && { opacity: 0.85 }]}
            onPress={() => setShowConfirm(true)}
          >
            <Text style={styles.logoutText}>Sign out</Text>
          </Pressable>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Pressable
            style={({ pressed }) => [styles.deleteButton, pressed && { opacity: 0.85 }]}
            onPress={() => setShowDeleteConfirm(true)}
          >
            <Text style={styles.deleteText}>Delete Account</Text>
          </Pressable>
        </View>

        {/* Confirm Delete Modal */}
        <Modal
          visible={showDeleteConfirm}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDeleteConfirm(false)}
        >
          <Pressable style={styles.overlay} onPress={() => setShowDeleteConfirm(false)}>
            <Pressable style={styles.modal}>
              <Text style={styles.modalTitle}>Delete Account?</Text>
              <Text style={styles.modalSub}>
                Your account will be deactivated immediately. You can recover it within 7 days by signing in. After 7 days, your account and data will be permanently deleted.
              </Text>
              <View style={styles.modalActions}>
                <Pressable
                  style={({ pressed }) => [styles.modalCancel, pressed && { opacity: 0.7 }]}
                  onPress={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [styles.modalConfirm, pressed && { opacity: 0.85 }]}
                  onPress={handleDeleteAccount}
                  disabled={deleting}
                >
                  {deleting ? (
                    <ActivityIndicator color={colors.white} size="small" />
                  ) : (
                    <Text style={styles.modalConfirmText}>Delete</Text>
                  )}
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEditModal(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setShowEditModal(false)}>
          <Pressable style={styles.modal}>
            <Text style={styles.modalTitle}>Edit Profile</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.textInput}
                value={formData.name}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, name: text }))}
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
                onChangeText={(text) => setFormData((prev) => ({ ...prev, email: text }))}
                placeholder="Enter email"
                placeholderTextColor={colors.textGrey}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.modalActions}>
              <Pressable
                style={({ pressed }) => [styles.modalCancel, pressed && { opacity: 0.7 }]}
                onPress={() => setShowEditModal(false)}
                disabled={saving}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.saveButton, pressed && { opacity: 0.85 }]}
                onPress={handleSaveProfile}
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
      </Modal>

      {/* Change Password Modal */}
      <Modal
        visible={showPasswordModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setShowPasswordModal(false)}>
          <Pressable style={styles.modal}>
            <Text style={styles.modalTitle}>Change Password</Text>

            <InputGroup label="Current Password">
              <View style={styles.passwordRow}>
                <TextInput
                  style={[styles.textInput, styles.passwordInput]}
                  value={passwordData.currentPassword}
                  onChangeText={(text) =>
                    setPasswordData((prev) => ({ ...prev, currentPassword: text }))
                  }
                  placeholder="Enter current password"
                  placeholderTextColor={colors.textGrey}
                  secureTextEntry={!showCurrentPassword}
                />
                <Pressable
                  style={styles.eyeBtn}
                  onPress={() => setShowCurrentPassword((p) => !p)}
                >
                  <Ionicons
                    name={showCurrentPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={colors.textGrey}
                  />
                </Pressable>
              </View>
            </InputGroup>

            <InputGroup label="New Password">
              <View style={styles.passwordRow}>
                <TextInput
                  style={[styles.textInput, styles.passwordInput]}
                  value={passwordData.newPassword}
                  onChangeText={(text) =>
                    setPasswordData((prev) => ({ ...prev, newPassword: text }))
                  }
                  placeholder="Enter new password"
                  placeholderTextColor={colors.textGrey}
                  secureTextEntry={!showNewPassword}
                />
                <Pressable
                  style={styles.eyeBtn}
                  onPress={() => setShowNewPassword((p) => !p)}
                >
                  <Ionicons
                    name={showNewPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={colors.textGrey}
                  />
                </Pressable>
              </View>
            </InputGroup>

            <InputGroup label="Confirm Password">
              <View style={styles.passwordRow}>
                <TextInput
                  style={[styles.textInput, styles.passwordInput]}
                  value={passwordData.confirmPassword}
                  onChangeText={(text) =>
                    setPasswordData((prev) => ({ ...prev, confirmPassword: text }))
                  }
                  placeholder="Re-enter new password"
                  placeholderTextColor={colors.textGrey}
                  secureTextEntry={!showConfirmPassword}
                />
                <Pressable
                  style={styles.eyeBtn}
                  onPress={() => setShowConfirmPassword((p) => !p)}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={colors.textGrey}
                  />
                </Pressable>
              </View>
            </InputGroup>

            <View style={styles.modalActions}>
              <Pressable
                style={({ pressed }) => [styles.modalCancel, pressed && { opacity: 0.7 }]}
                onPress={() => setShowPasswordModal(false)}
                disabled={savingPassword}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.saveButton, pressed && { opacity: 0.85 }]}
                onPress={handleChangePassword}
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
      </Modal>

      {/* Confirm Logout Modal */}
      <Modal
        visible={showConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirm(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setShowConfirm(false)}>
          <Pressable style={styles.modal}>
            <Text style={styles.modalTitle}>Sign out?</Text>
            <Text style={styles.modalSub}>
              You'll need to log back in to access your account.
            </Text>
            <View style={styles.modalActions}>
              <Pressable
                style={({ pressed }) => [styles.modalCancel, pressed && { opacity: 0.7 }]}
                onPress={() => setShowConfirm(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.modalConfirm, pressed && { opacity: 0.85 }]}
                onPress={handleLogout}
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
      </Modal>

    </>
  );
}

function InputGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      {children}
    </View>
  );
}

function InfoRow({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, valueColor ? { color: valueColor } : null]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xxl },
  header: {
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.white,
  },
  name: {
    fontSize: typography.subheading,
    fontWeight: '700',
    color: colors.white,
  },
  role: {
    fontSize: typography.small,
    color: 'rgba(255,255,255,0.6)',
  },
  idBadge: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    marginTop: spacing.xs,
  },
  idText: {
    fontSize: typography.label,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
    letterSpacing: 1,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.label,
    fontWeight: '700',
    color: colors.textGrey,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  editAction: {
    fontSize: typography.small,
    fontWeight: '600',
    color: colors.primary,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    gap: spacing.md,
  },
  infoLabel: {
    fontSize: typography.small,
    color: colors.textGrey,
    fontWeight: '500',
    flex: 1,
  },
  infoValue: {
    fontSize: typography.small,
    color: colors.textDark,
    fontWeight: '600',
    flex: 2,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  logoutButton: {
    backgroundColor: colors.error + '12',
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.error + '30',
  },
  logoutText: {
    color: colors.error,
    fontSize: typography.body,
    fontWeight: '600',
  },
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

  deleteButton: {
    backgroundColor: 'transparent',
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  deleteText: {
    color: colors.error,
    fontSize: typography.small,
    fontWeight: '600',
  },
});