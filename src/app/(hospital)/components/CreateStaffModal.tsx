import { colors, radius, spacing, typography } from '@/constants/theme';
import { createStaff } from '@/lib/hospital';
import { UserRole, UserRoleValues } from '@/types/role';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Toast from 'react-native-toast-message';

type Props = {
  close(): void;
  onCreated(staff: User): void;
}

export default function CreateStaffModal({ close, onCreated }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole | null>(null)

  const [loading, setLoading] = useState(false)
  const [error, setErr] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    setErr('');
    if (!name || !email || !role) return setErr('All fields are required')
    const data = {
      name, email, role
    }
    try {
      const res = await createStaff(data);
      Toast.show({ type: 'success', text1: 'User created' });
      onCreated(res)
    } catch (e: any) {
      setErr(e.message)
    } finally {
      setLoading(false);
    }
  }

  return (
    <Pressable style={styles.overlay} onPress={close}>
      <Pressable style={styles.card} onPress={() => { }}>
        <View style={styles.header}>
          <Text style={styles.title}>Add new staff</Text>
          <Pressable onPress={close} hitSlop={8} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>×</Text>
          </Pressable>
        </View>

        <View style={styles.form}>
          <InputGroup label='Name'>
            <TextInput
              value={name}
              onChangeText={setName}
              style={styles.input}
              placeholder="Jane Doe"
              placeholderTextColor={colors.textGrey}
            />
          </InputGroup>
          <InputGroup label='Email'>
            <TextInput
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              placeholder="jane@hospital.com"
              placeholderTextColor={colors.textGrey}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </InputGroup>
          <InputGroup label='Role'>
            <View style={styles.pillRow}>
              <Pressable
                style={[styles.rolePill, role === 'hospital_admin' && styles.rolePillActive]}
                onPress={() => setRole(UserRoleValues.HOSPITAL_ADMIN)}
              >
                <Text style={[styles.rolePillText, role === 'hospital_admin' && styles.rolePillTextActive]}>
                  Admin
                </Text>
              </Pressable>
              <Pressable
                style={[styles.rolePill, role === 'staff' && styles.rolePillActive]}
                onPress={() => setRole(UserRoleValues.STAFF)}
              >
                <Text style={[styles.rolePillText, role === 'staff' && styles.rolePillTextActive]}>
                  Staff
                </Text>
              </Pressable>
            </View>
          </InputGroup>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable style={({ pressed }) => [styles.submitBtn, pressed && { opacity: 0.85 }]} onPress={handleSubmit}>
            <Text style={styles.submitBtnText}>{loading ? 'Creating' : 'Create Staff'}</Text>
          </Pressable>
        </View>
      </Pressable>
    </Pressable>
  )
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    zIndex: 999,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: typography.subheading,
    fontWeight: '700',
    color: colors.textDark,
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
    lineHeight: 18,
    color: colors.textGrey,
    fontWeight: '600',
  },
  form: {
    gap: spacing.md,
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
  inputGroup: { gap: spacing.xs },
  label: {
    fontSize: typography.label,
    fontWeight: '600',
    color: colors.textDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pillRow: {
    flexDirection: 'row',
    gap: spacing.sm,
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
    borderColor: colors.primary,
  },
  rolePillText: {
    fontSize: typography.label,
    fontWeight: '600',
    color: colors.textGrey,
  },
  rolePillTextActive: {
    color: colors.primary,
  },
  error: {
    fontSize: typography.small,
    color: '#DC2626',
    fontWeight: '500',
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
    color: colors.white,
  },
})