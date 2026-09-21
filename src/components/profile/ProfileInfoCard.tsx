import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '@/constants/theme';

type ProfileInfoCardProps = {
  name?: string;
  email?: string;
  isActive?: boolean;
  onEditPress: () => void;
  onChangePasswordPress: () => void;
  onRemindersPress: () => void;
  onActivityPress: () => void;
};

export default function ProfileInfoCard({
  name,
  email,
  isActive,
  onEditPress,
  onChangePasswordPress,
  onRemindersPress,
  onActivityPress,
}: ProfileInfoCardProps) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Account</Text>
        <Pressable onPress={onEditPress} hitSlop={8}>
          <Text style={styles.editAction}>Edit Profile</Text>
        </Pressable>
      </View>
      <View style={styles.card}>
        <InfoRow label="Name" value={name ?? '—'} />
        <Divider />
        <InfoRow label="Email" value={email ?? '—'} />
        <Divider />
        <InfoRow
          label="Status"
          value={isActive ? 'Active' : 'Inactive'}
          valueColor={isActive ? colors.success : colors.error}
        />
        <Divider />
        <Pressable style={styles.infoRow} onPress={onChangePasswordPress}>
          <Text style={styles.infoLabel}>Password</Text>
          <View style={styles.actionValueRow}>
            <Text style={[styles.infoValue, { color: colors.primary }]}>Change Password</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.primary} />
          </View>
        </Pressable>
        <Divider />
        <Pressable style={styles.infoRow} onPress={onRemindersPress}>
          <Text style={styles.infoLabel}>Reminders</Text>
          <View style={styles.actionValueRow}>
            <Text style={[styles.infoValue, { color: colors.primary }]}>Manage reminders</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.primary} />
          </View>
        </Pressable>
        <Divider />
        <Pressable style={styles.infoRow} onPress={onActivityPress}>
          <Text style={styles.infoLabel}>Recent Activity</Text>
          <View style={styles.actionValueRow}>
            <Text style={[styles.infoValue, { color: colors.primary }]}>Recent activity</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.primary} />
          </View>
        </Pressable>
      </View>
    </View>
  );
}

function InfoRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
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
    textAlign: 'right',
  },
  actionValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
});
