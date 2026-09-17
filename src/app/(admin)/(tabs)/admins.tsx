import { colors, radius, spacing, typography } from '@/constants/theme';
import { createAdmin } from '@/lib/admin';
import { useAdminQuery } from '@/queries/admin';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type User = {
  _id: string;
  name: string;
  email: string;
  customId: string;
  isActive?: boolean;
  isPioneer?: boolean;
};

export default function AdminManagementScreen() {
  const insets = useSafeAreaInsets();
  const { data: admins, loading, refreshData } = useAdminQuery.admins();

  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const handleInvite = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Validation Error', 'Please fill in both name and email.');
      return;
    }

    setSubmitting(true);
    try {
      await createAdmin({ name: name.trim(), email: email.trim() });
      Alert.alert('Success', 'Admin invitation sent successfully.');
      setName('');
      setEmail('');
      setModalVisible(false);
      refreshData();
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to invite admin.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <View>
          <Text style={styles.title}>Super Admins</Text>
          <Text style={styles.meta}>Manage system administrators</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      {loading && !admins ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={admins}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No super admins found.</Text>
          }
          renderItem={({ item }) => <AdminCard item={item} />}
        />
      )}

      {/* Invite Admin Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalDismissArea} />
          </TouchableWithoutFeedback>

          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Invite Super Admin</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textGrey} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Jane Doe"
                placeholderTextColor={colors.textGrey}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="admin@example.com"
                placeholderTextColor={colors.textGrey}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, submitting && styles.buttonDisabled]}
              onPress={handleInvite}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.submitButtonText}>Send Invitation</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

function AdminCard({ item }: { item: User }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name ? item.name[0].toUpperCase() : 'A'}</Text>
        </View>
        <View style={styles.nameInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.cardName}>{item.name}</Text>
            {item.isPioneer && (
              <View style={styles.pioneerBadge}>
                <Ionicons name="star" size={12} color={colors.primary} />
                <Text style={styles.pioneerBadgeText}>Pioneer</Text>
              </View>
            )}
          </View>
          <Text style={styles.cardSub}>
            {item.customId} · {item.email}
          </Text>
        </View>
      </View>

      <View style={[styles.pill, item.isActive ? styles.pillActive : styles.pillInactive]}>
        <Text style={[styles.pillText, item.isActive ? styles.pillTextActive : styles.pillTextInactive]}>
          {item.isActive ? 'Active' : 'Inactive'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primaryDark,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.subheading,
    fontWeight: '700',
    color: colors.white,
  },
  meta: {
    fontSize: typography.small,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: spacing.lg, gap: spacing.sm },
  emptyText: {
    fontSize: typography.small,
    color: colors.textGrey,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  // Card Styles
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: typography.body,
    fontWeight: '700',
    color: colors.primary,
  },
  nameInfo: { flex: 1 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  cardName: {
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.textDark,
  },
  cardSub: {
    fontSize: typography.small,
    color: colors.textGrey,
    marginTop: 2,
  },
  pioneerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.full,
    backgroundColor: colors.primary + '15',
  },
  pioneerBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
  },
  pill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  pillActive: { backgroundColor: colors.success + '18' },
  pillInactive: { backgroundColor: colors.textGrey + '18' },
  pillText: { fontSize: typography.label, fontWeight: '600' },
  pillTextActive: { color: colors.success },
  pillTextInactive: { color: colors.textGrey },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalDismissArea: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: typography.subheading,
    fontWeight: '700',
    color: colors.textDark,
  },
  formGroup: { gap: spacing.xs },
  label: {
    fontSize: typography.small,
    fontWeight: '600',
    color: colors.textDark,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: typography.body,
    color: colors.textDark,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  submitButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: typography.body,
  },
  buttonDisabled: { opacity: 0.6 },
});