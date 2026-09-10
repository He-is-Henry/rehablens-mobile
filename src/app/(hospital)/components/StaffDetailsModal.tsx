import { colors, radius, spacing, typography } from '@/constants/theme';
import { getLinkedPatients, getStaffById, updateStaff } from '@/lib/hospital';
import { UserRole, UserRoleValues } from '@/types/role';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Toast from 'react-native-toast-message';
import AssignPatientSection from './AssignPatientSection';

type Props = {
  staffId: string;
  close(): void;
  onUpdated(): void;
}

export default function StaffDetailModal({ staffId, close, onUpdated }: Props) {
  const scrollRef = useRef<ScrollView>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole | null>(null);
  const [isActive, setIsActive] = useState(true);

  const [assignedLinks, setAssignedLinks] = useState<Link[]>([]);
  const [loadingAssigned, setLoadingAssigned] = useState(true);

  useEffect(() => {
    getStaffById(staffId)
      .then((staff) => {
        setName(staff.name);
        setEmail(staff.email);
        setRole(staff.role as UserRole);
        setIsActive(staff.isActive);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [staffId]);

  const loadAssigned = () => {
    setLoadingAssigned(true);
    getLinkedPatients(undefined, staffId)
      .then(setAssignedLinks)
      .finally(() => setLoadingAssigned(false));
  };

  useEffect(loadAssigned, [staffId]);

  const handleSave = async () => {
    setError('');
    if (!name || !email || !role) return setError('All fields are required');

    setSaving(true);
    try {
      await updateStaff(staffId, { name, email, role, isActive });
      Toast.show({ type: 'success', text1: 'Staff updated' });
      onUpdated();
      close();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal transparent statusBarTranslucent animationType="fade" onRequestClose={close}>
      <Pressable style={styles.overlay} onPress={close}>
        <Pressable style={styles.card} onPress={() => { }}>
          <View style={styles.header}>
            <Text style={styles.title}>Staff details</Text>
            <Pressable onPress={close} hitSlop={8} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>×</Text>
            </Pressable>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
          ) : (
            <ScrollView ref={scrollRef} contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
              <InputGroup label="Name">
                <TextInput value={name} onChangeText={setName} style={styles.input} />
              </InputGroup>
              <InputGroup label="Email">
                <TextInput value={email} onChangeText={setEmail} style={styles.input} autoCapitalize="none" />
              </InputGroup>
              <InputGroup label="Role">
                <View style={styles.pillRow}>
                  <Pressable
                    style={[styles.rolePill, role === 'hospital_admin' && styles.rolePillActive]}
                    onPress={() => setRole(UserRoleValues.HOSPITAL_ADMIN)}
                  >
                    <Text style={[styles.rolePillText, role === 'hospital_admin' && styles.rolePillTextActive]}>Admin</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.rolePill, role === 'staff' && styles.rolePillActive]}
                    onPress={() => setRole(UserRoleValues.STAFF)}
                  >
                    <Text style={[styles.rolePillText, role === 'staff' && styles.rolePillTextActive]}>Staff</Text>
                  </Pressable>
                </View>
              </InputGroup>
              <InputGroup label="Status">
                <Pressable
                  style={[styles.statusPill, isActive ? styles.statusPillActive : styles.statusPillInactive]}
                  onPress={() => setIsActive((v) => !v)}
                >
                  <Text style={[styles.statusPillText, isActive ? styles.statusTextActive : styles.statusTextInactive]}>
                    {isActive ? 'Active' : 'Inactive'}
                  </Text>
                </Pressable>
              </InputGroup>

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <Pressable
                style={({ pressed }) => [styles.submitBtn, pressed && { opacity: 0.85 }, saving && { opacity: 0.6 }]}
                onPress={handleSave}
                disabled={saving}
              >
                <Text style={styles.submitBtnText}>{saving ? 'Saving...' : 'Save changes'}</Text>
              </Pressable>

              <View style={styles.divider} />

              <InputGroup label="Assigned patients">
                {loadingAssigned ? (
                  <ActivityIndicator color={colors.primary} />
                ) : assignedLinks.length === 0 ? (
                  <Text style={styles.empty}>No patients assigned yet</Text>
                ) : (
                  <View style={styles.assignedList}>
                    {assignedLinks.map((link) => (
                      <View key={link._id} style={styles.assignedRow}>
                        <Text style={styles.assignedName}>{link.patientId.name}</Text>
                        <Text style={styles.assignedMeta}>{link.patientId.customId}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </InputGroup>

              <AssignPatientSection
                staffId={staffId}
                excludeLinkIds={assignedLinks.map((l) => l._id)}
                onAssigned={loadAssigned}
                onSearchFocus={() => scrollRef.current?.scrollToEnd({ animated: true })}

              />
            </ScrollView>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function InputGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '85%',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  title: {
    fontSize: typography.subheading,
    fontWeight: '700',
    color: colors.textDark
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.textGrey + '18',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 18,
    lineHeight: 18, color: colors.textGrey,
    fontWeight: '600'
  },
  loader: {
    paddingVertical: spacing.xl
  },
  form: {
    gap: spacing.md,
    paddingBottom: spacing.xl * 3,

  },
  inputGroup: {
    gap: spacing.xs
  },
  label: {
    fontSize: typography.label,
    fontWeight: '600',
    color: colors.textDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    fontSize: typography.body,
    color: colors.textDark,
  },
  pillRow: {
    flexDirection: 'row',
    gap: spacing.sm
  },
  rolePill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,

  },

  rolePillActive: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary
  },

  rolePillText: {
    fontSize: typography.label,
    fontWeight: '600',
    color: colors.textGrey
  },

  rolePillTextActive: {
    color: colors.primary
  },

  statusPill: {
    alignSelf: 'flex-start',

    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,

    borderRadius: radius.full,

  },

  statusPillActive: {
    backgroundColor: colors.success + '18'
  },

  statusPillInactive: {
    backgroundColor: colors.textGrey + '18'
  },

  statusPillText: {
    fontSize: typography.label,
    fontWeight: '600'
  },

  statusTextActive: {
    color: colors.success
  },

  statusTextInactive: {
    color: colors.textGrey
  },

  error: {
    fontSize: typography.small,
    color: '#DC2626',
    fontWeight: '500'
  },

  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,

    paddingVertical: spacing.sm + 4,
    alignItems: 'center',
    justifyContent: 'center',

  },

  submitBtnText: {
    fontSize: typography.body,
    fontWeight: '700',
    color: colors.white
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
  },

  empty: {
    fontSize: typography.small,
    color: colors.textGrey,
  },

  assignedList: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    overflow: 'hidden',
  },

  assignedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },

  assignedName: {
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.textDark,
  },

  assignedMeta: {
    fontSize: typography.small,
    color: colors.textGrey,
  },

});