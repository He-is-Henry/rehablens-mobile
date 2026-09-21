import { colors, radius, spacing, typography } from '@/constants/theme';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
};

export default function TermsCheckbox({ checked, onChange, error }: Props) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <Pressable
          style={[styles.checkbox, checked && styles.checkboxChecked]}
          onPress={() => onChange(!checked)}
          hitSlop={8}
        >
          {checked && <Text style={styles.checkmark}>✓</Text>}
        </Pressable>

        <Text style={styles.text}>
          I agree to the{' '}
          <Text
            style={styles.link}
            onPress={() => router.push('/(auth)/terms')}
          >
            Terms of Service
          </Text>{' '}
          and{' '}
          <Text
            style={styles.link}
            onPress={() => router.push('/(auth)/privacy')}
          >
            Privacy Policy
          </Text>
        </Text>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: spacing.sm,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: radius.sm || 4,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark,
  },
  checkmark: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  text: {
    flex: 1,
    fontSize: typography.small,
    color: colors.textGrey,
    lineHeight: 18,
  },
  link: {
    color: colors.primary,
    fontWeight: '600',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
});