import AssignmentList from '@/app/(patient)/components/AssignmentList';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { getPatientHospitalById } from '@/lib/patient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PatientHospitalScreen() {
  const { linkId } = useLocalSearchParams<{ linkId: string }>();
  const insets = useSafeAreaInsets();
  const [link, setLink] = useState<Link | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPatientHospitalById(linkId)
      .then(setLink)
      .finally(() => setLoading(false));
  }, [linkId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!link) return null;

  const hospital = link.hospitalId as any;
  const staff = link.staffId as any;

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.hospitalName}>{hospital?.name}</Text>
        <Text style={styles.hospitalMeta}>{hospital?.customId}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {/* Hospital info */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Hospital</Text>
          <View style={styles.card}>
            <InfoRow label="Name" value={hospital?.name ?? '—'} />
            <Divider />
            <InfoRow label="Address" value={hospital?.address ?? '—'} />
            <Divider />
            <InfoRow label="Email" value={hospital?.email ?? '—'} />
            <Divider />
            <InfoRow label="Status" value={link.verified ? 'Verified' : 'Pending'} valueColor={link.verified ? colors.success : colors.accent} />
          </View>
        </View>

        {/* Assigned staff */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Your assigned staff</Text>
          {staff ? (
            <View style={styles.card}>
              <View style={styles.staffRow}>
                <View style={styles.staffAvatar}>
                  <Text style={styles.staffAvatarText}>{staff.name[0]}</Text>
                </View>
                <View>
                  <Text style={styles.staffName}>{staff.name}</Text>
                  <Text style={styles.staffMeta}>{staff.customId} · {staff.email}</Text>
                </View>
              </View>
            </View>
          ) : (
            <Text style={styles.unassigned}>No staff assigned yet</Text>
          )}
        </View>
        <AssignmentList hospitalId={link.hospitalId._id} />
      </ScrollView>
    </View>
  );
}

function InfoRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, valueColor ? { color: valueColor } : null]} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    backgroundColor: colors.primaryDark,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  backBtn: { marginBottom: spacing.xs },
  backText: {
    fontSize: typography.small,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  hospitalName: {
    fontSize: typography.subheading,
    fontWeight: '700',
    color: colors.white,
  },
  hospitalMeta: {
    fontSize: typography.small,
    color: 'rgba(255,255,255,0.6)',
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  section: { gap: spacing.sm },
  sectionLabel: {
    fontSize: typography.label,
    fontWeight: '700',
    color: colors.textGrey,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
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
    flex: 2,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  staffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
  },
  staffAvatar: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  staffAvatarText: {
    fontSize: typography.body,
    fontWeight: '700',
    color: colors.primary,
  },
  staffName: {
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.textDark,
  },
  staffMeta: {
    fontSize: typography.small,
    color: colors.textGrey,
    marginTop: 2,
  },
  unassigned: {
    fontSize: typography.small,
    color: colors.accent,
    fontStyle: 'italic',
  },
  placeholder: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    padding: spacing.xl,
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: typography.small,
    color: colors.textGrey,
    textAlign: 'center',
  },
});