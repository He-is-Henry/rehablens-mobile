import { colors, radius, spacing, typography } from '@/constants/theme';
import { registerHospital } from '@/lib/hospital';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';

export default function HospitalRegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !email || !address || !phone || !adminName || !adminEmail || !adminPassword) {
      Toast.show({ type: 'error', text1: 'All fields are required' });
      return;
    }

    setLoading(true);
    try {
      await registerHospital({
        name,
        email,
        address,
        phone,
        admin: {
          name: adminName,
          email: adminEmail,
          password: adminPassword
        },
      });
      Toast.show({
        type: 'success',
        text1: 'Hospital registered',
        text2: 'You can now log in with your admin account',
      });
      router.replace('/(auth)/login');
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Registration failed',
        text2: err?.message ?? 'Something went wrong',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.sectionLabel}>Hospital Details</Text>

      <InputGroup label="Hospital Name">
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Lagos General Hospital"
          placeholderTextColor={colors.textGrey}
          autoCapitalize="words"
        />
      </InputGroup>

      <InputGroup label="Hospital Email">
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="contact@hospital.com"
          placeholderTextColor={colors.textGrey}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </InputGroup>

      <InputGroup label="Address">
        <TextInput
          style={styles.input}
          value={address}
          onChangeText={setAddress}
          placeholder="Full address"
          placeholderTextColor={colors.textGrey}
          autoCapitalize="sentences"
        />
      </InputGroup>

      <InputGroup label="Phone">
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="+234..."
          placeholderTextColor={colors.textGrey}
          keyboardType="phone-pad"
        />
      </InputGroup>

      <Text style={[styles.sectionLabel, { marginTop: spacing.sm }]}>
        Administrator Account
      </Text>

      <InputGroup label="Admin Name">
        <TextInput
          style={styles.input}
          value={adminName}
          onChangeText={setAdminName}
          placeholder="Full name"
          placeholderTextColor={colors.textGrey}
          autoCapitalize="words"
        />
      </InputGroup>

      <InputGroup label="Admin Email">
        <TextInput
          style={styles.input}
          value={adminEmail}
          onChangeText={setAdminEmail}
          placeholder="admin@hospital.com"
          placeholderTextColor={colors.textGrey}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </InputGroup>

      <InputGroup label="Password">
        <View style={styles.passwordRow}>
          <TextInput
            style={[styles.input, styles.passwordInput]}
            value={adminPassword}
            onChangeText={setAdminPassword}
            placeholder="••••••••"
            placeholderTextColor={colors.textGrey}
            secureTextEntry={!showPassword}
          />
          <Pressable
            style={styles.eyeBtn}
            onPress={() => setShowPassword(p => !p)}
          >
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={20}
              color={colors.textGrey}
            />
          </Pressable>
        </View>
      </InputGroup>

      <Pressable
        style={({ pressed }) => [styles.button, pressed && { opacity: 0.85 }]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color={colors.white} />
          : <Text style={styles.buttonText}>Register Hospital</Text>
        }
      </Pressable>
    </ScrollView>
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
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  sectionLabel: {
    fontSize: typography.small,
    fontWeight: '700',
    color: colors.textGrey,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  inputGroup: { gap: spacing.xs },
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
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopRightRadius: radius.md,
    borderBottomRightRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  buttonText: {
    color: colors.white,
    fontSize: typography.body,
    fontWeight: '600',
  },
});