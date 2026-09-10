import { colors, radius, spacing, typography } from '@/constants/theme';
import { resetPassword } from '@/lib/auth';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function ResetPasswordScreen() {
  const { token, email: emailParam } = useLocalSearchParams<{
    token?: string;
    email?: string;
  }>();

  const [email] = useState(emailParam ?? '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [manualCode, setManualCode] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(!token);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // if token came from deep link, hide code input by default
    if (token) setShowCodeInput(false);
  }, [token]);

  const handleReset = async () => {
    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!token && !manualCode) {
      setError('Please enter your reset code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await resetPassword({
        email,
        newPassword,
        token,
        manualCode: manualCode || undefined,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View style={styles.container}>
        <View style={styles.inner}>
          <View style={styles.successBox}>
            <View style={styles.successIconCircle}>
              <Ionicons name="checkmark" size={32} color={colors.white} />
            </View>
            <Text style={styles.successTitle}>Password reset</Text>
            <Text style={styles.successSub}>
              Your password has been updated. You can now log in with your new password.
            </Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.button, pressed && { opacity: 0.85 }]}
            onPress={() => router.replace('/(auth)/login')}
          >
            <Text style={styles.buttonText}>Back to login</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>
        <View style={styles.header}>
          <Text style={styles.title}>Reset password</Text>
          <Text style={styles.sub}>Choose a new password for your account.</Text>
        </View>

        <View style={styles.form}>

          {/* Code input — shown when no token or user toggled it */}
          {showCodeInput && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Reset code</Text>
              <TextInput
                style={[styles.input, styles.codeInput]}
                value={manualCode}
                onChangeText={setManualCode}
                placeholder="000000"
                placeholderTextColor={colors.textGrey}
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>
          )}
          <View style={styles.passwordContainer}></View>
          <Text style={styles.label}>New password</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="••••••••"
              placeholderTextColor={colors.textGrey}
              secureTextEntry={!showPassword}
              autoComplete='password'
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
        </View>


        <View style={styles.passwordContainer}>
          <Text style={styles.label}>Confirm password</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="••••••••"
              placeholderTextColor={colors.textGrey}
              secureTextEntry={!showConfirm}
            />

            <Pressable
              style={styles.eyeBtn}
              onPress={() => setShowConfirm(p => !p)}
            >
              <Ionicons
                name={showConfirm ? 'eye-off' : 'eye'}
                size={20}
                color={colors.textGrey}
              />
            </Pressable>
          </View>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          style={({ pressed }) => [styles.button, pressed && { opacity: 0.85 }]}
          onPress={handleReset}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color={colors.white} />
            : <Text style={styles.buttonText}>Reset password</Text>
          }
        </Pressable>

        {/* Toggle between code and link flow */}
        {token && (
          <Pressable onPress={() => setShowCodeInput(!showCodeInput)}>
            <Text style={styles.link}>
              {showCodeInput ? 'Use link instead' : "Can't open the link? Enter code"}
            </Text>
          </Pressable>
        )}

      </View>
    </KeyboardAvoidingView >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  inner: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    gap: spacing.xl,
  },
  header: {
    gap: spacing.xs,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  sub: {
    fontSize: typography.body,
    color: colors.textGrey,
    lineHeight: 22,
  },
  form: {
    gap: spacing.md,
  },
  passwordContainer: {
    gap: spacing.xs,
  },
  inputGroup: {
    gap: spacing.xs,
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
  codeInput: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 8,
    textAlign: 'center',
    color: colors.primaryDark,
  },
  error: {
    fontSize: typography.small,
    color: colors.error,
    textAlign: 'center',
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
  link: {
    textAlign: 'center',
    fontSize: typography.small,
    color: colors.primary,
    fontWeight: '500',
  },
  successBox: {
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  successIconCircle: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: colors.success ?? '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    fontSize: typography.subheading,
    fontWeight: '700',
    color: colors.textDark,
  },
  successSub: {
    fontSize: typography.body,
    color: colors.textGrey,
    textAlign: 'center',
    lineHeight: 22,
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
  eyeText: { fontSize: 16 },
});