import SharedProfile from '@/components/SharedProfile';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/context/auth.context';
import { StyleSheet, Text, View } from 'react-native';

export default function HospitalProfile() {
  const { user } = useAuth();
  const hospital = user?.hospitalId as any;

  return (
    <SharedProfile
      extra={
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hospital</Text>
          <View style={styles.card}>
            <InfoRow label="Name" value={hospital?.name ?? '—'} />
            <Divider />
            <InfoRow label="ID" value={hospital?.customId ?? '—'} />
            <Divider />
            <InfoRow label="Email" value={hospital?.email ?? '—'} />
            <Divider />
            <InfoRow label="Address" value={hospital?.address ?? '—'} />
          </View>
        </View>
      }
    />
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={1}>{value}</Text>
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
  sectionTitle: {
    fontSize: typography.label,
    fontWeight: '700',
    color: colors.textGrey,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
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
});