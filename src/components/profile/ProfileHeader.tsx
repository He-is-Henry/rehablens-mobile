import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '@/constants/theme';

type ProfileHeaderProps = {
  name?: string;
  role?: string;
  customId?: string;
  topInset: number;
};

const roleLabel: Record<string, string> = {
  hospital_admin: 'Hospital Administrator',
  staff: 'Staff',
  patient: 'Patient',
  admin: 'Super Admin',
};

export default function ProfileHeader({ name, role, customId, topInset }: ProfileHeaderProps) {
  return (
    <View style={[styles.header, { paddingTop: topInset + spacing.lg }]}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{name?.[0]?.toUpperCase() ?? '?'}</Text>
      </View>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.role}>{roleLabel[role ?? ''] ?? role}</Text>
      {customId && (
        <View style={styles.idBadge}>
          <Text style={styles.idText}>{customId}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
});
