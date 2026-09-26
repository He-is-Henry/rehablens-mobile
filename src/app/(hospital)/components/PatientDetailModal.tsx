import { colors, radius, spacing, typography } from '@/constants/theme';
import { assignStaffToPatient } from '@/lib/hospital';
import { useHospitalQuery } from '@/queries/hospital';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
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
  link: Link;
  close(): void;
  onAssignExercise(): void;
  onUpdated?(updatedPatient: Link): void;
};

export default function PatientDetailModal({
  link,
  close,
  onAssignExercise,
  onUpdated,
}: Props) {
  const patient = link.patientId;

  const { data: assignments, loading: loadingAssignments } =
    useHospitalQuery.assignments(patient._id);

  const { data: staff, loading: loadingStaff } = useHospitalQuery.staff();

  const [assigningStaffId, setAssigningStaffId] = useState<string | null>(null);

  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(
    link.staffId?._id ?? null
  );

  useEffect(() => {
    setSelectedStaffId(link.staffId?._id ?? null);
  }, [link.staffId?._id]);

  const assignedStaffMember = staff?.find((s) => s._id === selectedStaffId);

  const handleAssignStaff = async (staffId: string) => {
    const previousStaffId = selectedStaffId;
    setSelectedStaffId(staffId);
    setAssigningStaffId(staffId);

    try {
      const updated = await assignStaffToPatient(link._id, staffId);
      onUpdated?.(updated);
    } catch (error) {
      console.error('Failed to assign staff:', error);
      setSelectedStaffId(previousStaffId);
    } finally {
      setAssigningStaffId(null);
    }
  };

  return (
    <Modal
      transparent
      statusBarTranslucent
      animationType="fade"
      onRequestClose={close}
    >
      <Pressable style={styles.overlay} onPress={close}>
        <View style={styles.card} onStartShouldSetResponder={() => true}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Patient Details</Text>
            <Pressable onPress={close} hitSlop={10} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={colors.textGrey} />
            </Pressable>
          </View>

          {/* Patient Info Row */}
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {patient?.name?.[0]?.toUpperCase() ?? 'P'}
              </Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{patient?.name ?? 'Unknown Patient'}</Text>
              <Text style={styles.meta}>ID: {patient?.customId ?? 'N/A'}</Text>
              {patient?.email ? (
                <Text style={styles.meta}>{patient.email}</Text>
              ) : null}
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
                  link.verified
                    ? styles.badgeTextVerified
                    : styles.badgeTextPending,
                ]}
              >
                {link.verified ? 'Verified' : 'Pending'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Content Body */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <InfoRow
              label="Linked Since"
              value={new Date(link.createdAt).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            />

            {/* 1. STAFF ASSIGNMENT SECTION */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="person-outline" size={16} color={colors.primary} />
                <Text style={styles.sectionLabel}>Assigned Staff</Text>
              </View>

              {assignedStaffMember && (
                <View style={styles.currentStaffBadge}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                  <Text style={styles.currentStaffText}>
                    Currently:{' '}
                    <Text style={styles.boldText}>
                      {assignedStaffMember.name ?? assignedStaffMember.email}
                    </Text>
                  </Text>
                </View>
              )}

              {loadingStaff || !staff ? (
                <ActivityIndicator color={colors.primary} style={styles.loader} />
              ) : staff.length === 0 ? (
                <Text style={styles.empty}>No staff members available</Text>
              ) : (
                <View style={styles.staffChipsWrap}>
                  {staff.map((member: any) => {
                    const isAssigned = selectedStaffId === member._id;
                    const isAssigning = assigningStaffId === member._id;

                    return (
                      <Pressable
                        key={member._id}
                        disabled={isAssigned || Boolean(assigningStaffId)}
                        style={[
                          styles.staffChip,
                          isAssigned && styles.staffChipActive,
                        ]}
                        onPress={() => handleAssignStaff(member._id)}
                      >
                        {isAssigning ? (
                          <ActivityIndicator size="small" color={isAssigned ? colors.white : colors.primary} />
                        ) : (
                          <>
                            <Ionicons
                              name={isAssigned ? 'checkmark-circle' : 'add-circle-outline'}
                              size={14}
                              color={isAssigned ? colors.white : colors.primary}
                            />
                            <Text
                              style={[
                                styles.staffChipText,
                                isAssigned && styles.staffChipTextActive,
                              ]}
                            >
                              {member.name ?? member.email}
                            </Text>
                          </>
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>

            {/* 2. EXERCISE & SCHEDULE SECTION */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="fitness-outline" size={16} color={colors.primary} />
                <Text style={styles.sectionLabel}>Assigned Exercises & Schedules</Text>
              </View>

              {loadingAssignments || !assignments ? (
                <ActivityIndicator color={colors.primary} style={styles.loader} />
              ) : assignments.length === 0 ? (
                <View style={styles.emptyBox}>
                  <Ionicons name="calendar-outline" size={22} color={colors.textGrey} />
                  <Text style={styles.empty}>No exercises assigned yet</Text>
                </View>
              ) : (
                assignments.map((a: any) => (
                  <View key={a._id} style={styles.assignmentCard}>
                    <View style={styles.assignmentInfo}>
                      <Text style={styles.assignmentName}>
                        {a.exerciseId?.name ?? 'Exercise'}
                      </Text>
                      <Text style={styles.assignmentMeta}>
                        {a.customReps ?? a.exerciseId?.targetReps ?? 0} reps · {a.status ?? 'Active'}
                      </Text>
                    </View>

                    <View style={styles.assignmentActions}>
                      <Pressable
                        style={styles.scheduleBtn}
                        onPress={() => {
                          close();
                          router.push({
                            pathname: '/(hospital)/schedules/[assignmentId]',
                            params: { assignmentId: a._id, linkId: link._id },
                          });
                        }}
                      >
                        <Ionicons
                          name="calendar-outline"
                          size={13}
                          color={colors.primary}
                        />
                        <Text style={styles.scheduleBtnText}>Schedule</Text>
                      </Pressable>

                      <Pressable
                        hitSlop={8}
                        onPress={() => {
                          close();
                          router.push({
                            pathname:
                              '/(hospital)/patient/assignment/[assignmentId]',
                            params: {
                              assignmentId: a._id,
                              patientId: patient._id,
                            },
                          });
                        }}
                      >
                        <Text style={styles.viewText}>View →</Text>
                      </Pressable>
                    </View>
                  </View>
                ))
              )}
            </View>
          </ScrollView>

          {/* Primary Bottom Action */}
          <Pressable
            style={styles.actionBtnPrimary}
            onPress={() => {
              close();
              onAssignExercise();
            }}
          >
            <Ionicons name="add" size={18} color={colors.white} />
            <Text style={styles.actionBtnText}>Assign New Exercise</Text>
          </Pressable>
        </View>
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
    padding: spacing.md,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '82%',
    flexShrink: 1,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.subheading,
    fontWeight: '700',
    color: colors.textDark,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textDark,
    marginBottom: 2,
  },
  meta: {
    fontSize: 13,
    color: colors.textGrey,
  },
  badge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  badgeVerified: {
    backgroundColor: colors.success + '20',
  },
  badgePending: {
    backgroundColor: colors.accent + '20',
  },
  badgeText: {
    fontSize: typography.label,
    fontWeight: '600',
  },
  badgeTextVerified: {
    color: colors.success,
  },
  badgeTextPending: {
    color: colors.accent,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  scrollView: {
    flexShrink: 1,
  },
  scrollContent: {
    gap: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: typography.body,
    color: colors.textGrey,
  },
  infoValue: {
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.textDark,
  },
  section: {
    gap: spacing.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  sectionLabel: {
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.textDark,
  },
  currentStaffBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  currentStaffText: {
    fontSize: 13,
    color: colors.textDark,
  },
  boldText: {
    fontWeight: '600',
  },
  loader: {
    marginVertical: spacing.xs,
  },
  empty: {
    fontSize: 13,
    color: colors.textGrey,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    gap: spacing.xs,
    backgroundColor: colors.background,
    borderRadius: radius.sm,
  },
  staffChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  staffChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  staffChipActive: {
    backgroundColor: colors.primary,
  },
  staffChipText: {
    fontSize: 13,
    color: colors.primary,
  },
  staffChipTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  assignmentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  assignmentInfo: {
    flex: 1,
  },
  assignmentName: {
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.textDark,
    marginBottom: 2,
  },
  assignmentMeta: {
    fontSize: 13,
    color: colors.textGrey,
  },
  assignmentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  scheduleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  scheduleBtnText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
  },
  viewText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  actionBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: radius.md,
    marginTop: spacing.md,
  },
  actionBtnText: {
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.white,
  },
});