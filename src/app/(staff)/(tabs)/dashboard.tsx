import CreateAssignmentModal from '@/app/(hospital)/components/CreateAssignmentModal';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/context/auth.context';
import { useStaffQuery } from '@/queries/staff';
import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PatientDetailModal from '../components/PatientDetailModal';

export default function StaffDashboard() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const { data: links, loading, refreshData: loadData } = useStaffQuery.patients()

  const [selected, setSelected] = useState<Link | null>(null);
  const [assignTarget, setAssignTarget] = useState<Link | null>(null);

  const hospital = user?.hospitalId as any;


  return (
    <View style={styles.container}>
      {selected && (
        <PatientDetailModal
          link={selected}
          close={() => setSelected(null)}
          onAssignExercise={() => {
            const currentSelected = selected;
            setSelected(null);
            setAssignTarget(currentSelected);
          }}
        />
      )}

      {assignTarget && (
        <CreateAssignmentModal
          patientId={assignTarget.patientId._id}
          patientName={assignTarget.patientId.name}
          close={() => setAssignTarget(null)}
          onCreated={loadData}
          isPatient={true}
        />
      )}

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <View>
          <Text style={styles.hospitalName}>{hospital?.name ?? 'Your Hospital'}</Text>
          <Text style={styles.meta}>{user?.customId} · {user?.name}</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Staff</Text>
        </View>
      </View>

      {/* List */}
      {loading || !links ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={links}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <Text style={styles.listHeader}>
              {links.length} {links.length === 1 ? 'patient' : 'patients'}
            </Text>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyLabel}>No patients assigned</Text>
              <Text style={styles.emptySub}>Your hospital admin will assign patients to you</Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [styles.card, pressed && { opacity: 0.8 }]}
              onPress={() => setSelected(item)}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.patientId.name[0]}</Text>
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardName}>{item.patientId.name}</Text>
                <Text style={styles.cardMeta}>{item.patientId.customId}</Text>
                <Text style={styles.cardMeta}>{item.patientId.email}</Text>
              </View>
              <View style={[
                styles.pill,
                item.verified ? styles.pillVerified : styles.pillPending,
              ]}>
                <Text style={[
                  styles.pillText,
                  item.verified ? styles.pillTextVerified : styles.pillTextPending,
                ]}>
                  {item.verified ? 'Verified' : 'Pending'}
                </Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primaryDark,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  hospitalName: {
    fontSize: typography.subheading,
    fontWeight: '700',
    color: colors.white,
    marginBottom: spacing.xs,
  },
  meta: {
    fontSize: typography.small,
    color: 'rgba(255,255,255,0.6)',
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  badgeText: {
    fontSize: typography.label,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: spacing.md, gap: spacing.sm },
  listHeader: {
    fontSize: typography.small,
    color: colors.textGrey,
    fontWeight: '600',
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: typography.body,
    fontWeight: '700',
    color: colors.primary,
  },
  cardInfo: { flex: 1, gap: 2 },
  cardName: {
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.textDark,
  },
  cardMeta: {
    fontSize: typography.small,
    color: colors.textGrey,
  },
  pill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  pillVerified: { backgroundColor: colors.success + '18' },
  pillPending: { backgroundColor: colors.accent + '25' },
  pillText: { fontSize: typography.label, fontWeight: '600' },
  pillTextVerified: { color: colors.success },
  pillTextPending: { color: colors.accent },
  empty: { alignItems: 'center', paddingTop: spacing.xxl, gap: spacing.xs },
  emptyLabel: {
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.textDark,
  },
  emptySub: {
    fontSize: typography.small,
    color: colors.textGrey,
    textAlign: 'center',
  },
});