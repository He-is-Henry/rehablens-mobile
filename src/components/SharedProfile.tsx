import { router } from 'expo-router';
import { ReactNode, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { colors, radius, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/context/auth.context';
import { useRefresh } from '@/hooks/useRefresh';
import { changePassword, logout, revokeAllSessions, revokeSession } from '@/lib/auth';

import { OutdatedBanner } from './OutdatedBanner';
import SessionList from './SessionList';
import ChangePasswordModal from './profile/ChangePasswordModal';
import DeleteAccountModal from './profile/DeleteAccountModal';
import EditProfileModal from './profile/EditProfileModal';
import LogoutModal from './profile/LogoutModal';
import ProfileHeader from './profile/ProfileHeader';
import ProfileInfoCard from './profile/ProfileInfoCard';
import VersionFooter from './profile/VersionFooter';

type Props = {
  extra?: ReactNode;
};

export default function SharedProfile({ extra }: Props) {
  const { user, clearAuth, sessions, setSessionsData, editProfile, fetchCurrentUser, deleteAccount } = useAuth();
  const insets = useSafeAreaInsets();

  const [loggingOut, setLoggingOut] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<EditProfilePayload>({
    name: '',
    email: '',
  });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { refreshing, onRefreshControl } = useRefresh(fetchCurrentUser);

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
      setTimeout(() => {
        Toast.show({ type: 'success', text1: 'Profile updated successfully' });
      }, 300);
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
      setTimeout(() => {
        Toast.show({ type: 'success', text1: 'Password changed successfully' });
      }, 300);
    } catch (e: any) {
      Toast.show({
        type: 'error',
        text1: 'Change Password Failed',
        text2: e?.message ? e.message : 'Could not change password',
      });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefreshControl} />}
      >
        {/* Header */}
        <ProfileHeader
          name={user?.name}
          role={user?.role}
          customId={user?.customId}
          topInset={insets.top}
        />

        {/* Account Info Card */}
        <ProfileInfoCard
          name={user?.name}
          email={user?.email}
          isActive={user?.isActive}
          onEditPress={openEditModal}
          onChangePasswordPress={openPasswordModal}
          onRemindersPress={() => router.push('/reminders')}
          onActivityPress={() => router.push('/activity')}
        />

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

        <OutdatedBanner inline={true} />

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

        {/* Dynamic App Version Footer */}
        <VersionFooter />
      </ScrollView>

      <EditProfileModal
        visible={showEditModal}
        formData={formData}
        saving={saving}
        onClose={() => setShowEditModal(false)}
        onChangeFormData={(field, val) => setFormData((prev) => ({ ...prev, [field]: val }))}
        onSave={handleSaveProfile}
      />

      <ChangePasswordModal
        visible={showPasswordModal}
        passwordData={passwordData}
        savingPassword={savingPassword}
        onClose={() => setShowPasswordModal(false)}
        onChangePasswordData={(field, val) => setPasswordData((prev) => ({ ...prev, [field]: val }))}
        onSubmit={handleChangePassword}
      />

      <LogoutModal
        visible={showConfirm}
        loggingOut={loggingOut}
        onClose={() => setShowConfirm(false)}
        onLogout={handleLogout}
      />

      <DeleteAccountModal
        visible={showDeleteConfirm}
        deleting={deleting}
        onClose={() => setShowDeleteConfirm(false)}
        onDelete={handleDeleteAccount}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xxl },
  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
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
