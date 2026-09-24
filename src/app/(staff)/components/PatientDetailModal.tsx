import { colors, radius, spacing, typography } from '@/constants/theme';
import { useStaffQuery } from '@/queries/staff';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type Props = {
  link: any;
  close(): void;
  onAssignExercise(): void;
};

export default function PatientDetailModal({ link, close, onAssignExercise }: Props) {
  const patient = link.patientId;
  const { data: assignments, loading: loadingAssignments } = useStaffQuery.patientAssignments(link._id);

  return (
    <Modal transparent statusBarTranslucent animationType="fade" onRequestClose={close}>
      <Pressable style={styles.overlay} onPress={close}>
        <Pressable style={styles.card} onPress={() => { }}>
          <View style={styles.header}>
            <Text style={styles.title}>Patient details</Text>
            <Pressable onPress={close} hitSlop={8} style={styles.closeBtn}>
              <Ionicons name="close" size={18} color={colors.textGrey} />
            </Pressable>
          </View>

          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{patient.name[0]}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{patient.name}</Text>
              <Text style={styles.meta}>{patient.customId}</Text>
              <Text style={styles.meta}>{patient.email}</Text>
            </View>
            <View
              style={[
                styles.badge,
                link.verified ? styles.badgeVerified : styles.badgePending,
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  link.verified ? styles.badgeTextVerified : styles.badgeTextPending,
                ]}
              >
                {link.verified ? 'Verified' : 'Pending'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <ScrollView contentContainerStyle={styles.scrollContent}>
            <InfoRow
              label="Linked since"
              value={new Date(link.createdAt).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            />

            <View style={styles.assignmentsSection}>
              <Text style={styles.sectionLabel}>Assignments</Text>

              {loadingAssignments || !assignments ? (
                <ActivityIndicator color={colors.primary} />
              ) : assignments.length === 0 ? (
                <Text style={styles.empty}>No assignments yet</Text>
              ) : (
                assignments.map((a: any) => (
                  <View key={a._id} style={styles.assignmentRow}>
                    <Pressable
                      style={styles.assignmentInfo}
                      onPress={() => {
                        close();
                        router.push({
                          pathname: '/(staff)/patient/[patientId]/assignment/[assignmentId]',
                          params: { assignmentId: a._id, patientId: patient._id },
                        });
                      }}
                    >
                      <Text style={styles.assignmentName}>
                        {a.exerciseId?.name ?? 'Exercise'}
                      </Text>
                      <Text style={styles.assignmentMeta}>
                        {a.customReps ?? a.exerciseId?.targetReps} reps · {a.status}
                      </Text>
                    </Pressable>

                    <View style={styles.assignmentActions}>
                      <Pressable
                        style={styles.scheduleBadgeBtn}
                        onPress={() => {
                          close();
                          router.push({
                            pathname: '/(staff)/schedules/[assignmentId]',
                            params: { assignmentId: a._id },
                          });
                        }}
                      >
                        <Ionicons name="calendar-outline" size={14} color={colors.primary} />
                        <Text style={styles.scheduleBadgeText}>Schedule</Text>
                      </Pressable>

                      <Pressable
                        onPress={() => {
                          close();
                          router.push({
                            pathname: '/(staff)/patient/[patientId]/assignment/[assignmentId]',
                            params: { assignmentId: a._id, patientId: patient._id },
                          });
                        }}
                      >
                        <Text style={styles.assignText}>View →</Text>
                      </Pressable>
                    </View>
                  </View>
                ))
              )}
            </View>

            <Pressable
              style={styles.actionBtnPrimary}
              onPress={() => {
                close();
                onAssignExercise();
              }}
            >
              <Text style={styles.actionBtnText}>Assign exercise</Text>
            </Pressable>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '85%',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.md,
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
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: typography.subheading,
    fontWeight: '700',
    color: colors.primary,
  },
  info: { flex: 1, gap: 2 },
  name: {
    fontSize: typography.body,
    fontWeight: '700',
    color: colors.textDark,
  },
  meta: {
    fontSize: typography.small,
    color: colors.textGrey,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  badgeVerified: { backgroundColor: colors.success + '18' },
  badgePending: { backgroundColor: colors.accent + '25' },
  badgeText: { fontSize: typography.label, fontWeight: '700' },
  badgeTextVerified: { color: colors.success },
  badgeTextPending: { color: colors.accent },
  divider: { height: 1, backgroundColor: colors.border },
  scrollContent: { gap: spacing.md, paddingBottom: spacing.xl },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: typography.small,
    color: colors.textGrey,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: typography.small,
    color: colors.textDark,
    fontWeight: '600',
  },
  assignmentsSection: { gap: spacing.sm },
  sectionLabel: {
    fontSize: typography.label,
    fontWeight: '700',
    color: colors.textGrey,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  assignmentRow: {
    padding: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  assignmentInfo: { flex: 1, gap: 2 },
  assignmentName: {
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.textDark,
  },
  assignmentMeta: {
    fontSize: typography.small,
    color: colors.textGrey,
  },
  assignmentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  scheduleBadgeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary + '12',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  scheduleBadgeText: {
    fontSize: typography.small - 1,
    fontWeight: '700',
    color: colors.primary,
  },
  assignText: {
    fontSize: typography.label,
    fontWeight: '600',
    color: colors.primary,
  },
  empty: {
    fontSize: typography.small,
    color: colors.textGrey,
    fontStyle: 'italic',
  },
  actionBtnPrimary: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.white,
  },
});
