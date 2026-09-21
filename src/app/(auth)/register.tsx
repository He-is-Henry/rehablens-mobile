import { colors, radius, spacing, typography } from '@/constants/theme';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HospitalRegisterForm from './components/HospitalRegisterForm';
import PatientRegisterForm from './components/PatientRegisterForm';

type Tab = 'Patient' | 'Hospital';
const TABS: Tab[] = ['Patient', 'Hospital'];

export default function RegisterScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('Patient');
  const insets = useSafeAreaInsets();


  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.brand}>RehabLens</Text>
        <Text style={styles.sub}>Create your account</Text>
      </View>

      {/* Tab selector */}
      <View style={styles.tabContainer}>
        <View style={styles.tabBar}>
          {TABS.map((tab) => (
            <Pressable
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Form */}
      {activeTab === 'Patient'
        ? <PatientRegisterForm />
        : <HospitalRegisterForm />
      }

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account?</Text>
        <Pressable onPress={() => router.replace('/(auth)/login')}>
          <Text style={styles.footerLink}> Sign in</Text>
        </Pressable>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.xs,
  },
  brand: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primaryDark,
    letterSpacing: -0.5,
  },
  sub: {
    fontSize: typography.small,
    color: colors.textGrey,
  },
  tabContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.border,
    borderRadius: radius.full,
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radius.full,
  },
  tabActive: {
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: typography.small,
    fontWeight: '500',
    color: colors.textGrey,
  },
  tabTextActive: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
  footerText: {
    fontSize: typography.small,
    color: colors.textGrey,
  },
  footerLink: {
    fontSize: typography.small,
    color: colors.primary,
    fontWeight: '600',
  },
});