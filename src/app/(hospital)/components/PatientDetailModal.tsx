import { colors, radius, spacing, typography } from '@/constants/theme';
import {
  assignStaffToPatient,
  togglePatientVerification
} from '@/lib/hospital';
import { useHospitalQuery } from '@/queries/hospital';
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
import Toast from 'react-native-toast-message';

type Props = {
  link: Link;
  close(): void;
  onUpdated(updatedLink: Link): void;
  onAssignExercise(): void;
};



export default function PatientDetailModal({ link, close, onUpdated, onAssignExercise }: Props) {
  const [currentLink, setCurrentLink] = useState<Link>(link);
  const currentStaff = currentLink.staffId as User | null;

  const { data: staff, loading: loadingStaff } = useHospitalQuery.staff();

  const [togglingVerify, setTogglingVerify] = useState(false);
  const [assigningId, setAssigningId] = useState('');

  const patient = currentLink.patientId;

  const { data: assignments, loading: loadingAssignments } = useHospitalQuery.assignments(patient._id);

  useEffect(() => {
    console.log(assignments)
  }, [assignments])


  useEffect(() => {
  }, [assignments])
  const handleToggleVerify = async () => {
    setTogglingVerify(true);
    try {
      const updated = await togglePatientVerification(currentLink._id);
      setCurrentLink(updated);
      Toast.show({
        type: 'success',
        text1: updated.verified ? 'Patient verified' : 'Patient unverified',
      });
      onUpdated(updated);
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Failed', text2: e.message });
    } finally {
      setTogglingVerify(false);
    }
  };

  const handleAssign = async (staffId: string) => {
    setAssigningId(staffId);
    try {
      const updated = await assignStaffToPatient(currentLink._id, staffId);
      setCurrentLink(updated);
      Toast.show({ type: 'success', text1: 'Staff assigned' });
      onUpdated(updated);
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Failed', text2: e.message });
    } finally {
      setAssigningId('');
    }
  };


  return (
    <Modal transparent statusBarTranslucent animationType="fade" onRequestClose={close}>
      <Pressable style={styles.overlay} onPress={close}>
        <Pressable style={styles.card} onPress={() => { }}>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Patient details</Text>
            <Pressable onPress={close} hitSlop={8} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>×</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

            {/* Patient info */}
            <View style={styles.infoCard}>
              <View style={styles.avatarRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{patient.name[0]}</Text>
                </View>
                <View style={styles.avatarInfo}>
                  <Text style={styles.name}>{patient.name}</Text>
                  <Text style={styles.meta}>{patient.customId}</Text>
                  <Text style={styles.meta}>{patient.email}</Text>
                </View>
                <View style={[
                  styles.verifiedBadge,
                  currentLink.verified ? styles.verifiedBadgeActive : styles.verifiedBadgePending,
                ]}>
                  <Text style={[
                    styles.verifiedBadgeText,
                    currentLink.verified ? styles.verifiedTextActive : styles.verifiedTextPending,
                  ]}>
                    {currentLink.verified ? 'Verified' : 'Pending'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Toggle verification */}
            <Pressable
              style={({ pressed }) => [
                styles.actionBtn,
                currentLink.verified ? styles.actionBtnDanger : styles.actionBtnPrimary,
                pressed && { opacity: 0.85 },
                togglingVerify && { opacity: 0.6 },
              ]}
              onPress={handleToggleVerify}
              disabled={togglingVerify}
            >
              {togglingVerify
                ? <ActivityIndicator color={colors.white} size="small" />
                : <Text style={styles.actionBtnText}>
                  {currentLink.verified ? 'Unverify patient' : 'Verify patient'}
                </Text>
              }
            </Pressable>

            {/* Current staff */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Assigned staff</Text>
              {currentStaff ? (
                <View style={styles.currentStaffCard}>
                  <View style={styles.staffAvatar}>
                    <Text style={styles.staffAvatarText}>{currentStaff.name[0]}</Text>
                  </View>
                  <View>
                    <Text style={styles.staffName}>{currentStaff.name}</Text>
                    <Text style={styles.staffMeta}>{currentStaff.customId}</Text>
                  </View>
                </View>
              ) : (
                <Text style={styles.unassigned}>No staff assigned yet</Text>
              )}
            </View>

            {/* Reassign staff */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>
                {currentStaff ? 'Reassign to' : 'Assign staff'}
              </Text>
              {loadingStaff || !staff ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <View style={styles.staffList}>
                  {staff
                    .filter((s) => s._id !== (currentStaff as any)?._id)
                    .map((s, index, arr) => (
                      <Pressable
                        key={s._id}
                        style={({ pressed }) => [
                          styles.staffRow,
                          pressed && { opacity: 0.7 },
                          index < arr.length - 1 && styles.staffRowBorder,
                        ]}
                        onPress={() => handleAssign(s._id)}
                        disabled={assigningId === s._id}
                      >
                        <View style={styles.staffRowInfo}>
                          <Text style={styles.staffRowName}>{s.name}</Text>
                          <Text style={styles.staffRowMeta}>{s.customId}</Text>
                        </View>
                        {assigningId === s._id
                          ? <ActivityIndicator size="small" color={colors.primary} />
                          : <Text style={styles.assignText}>Assign</Text>
                        }
                      </Pressable>
                    ))
                  }
                  {staff.filter((s) => s._id !== (currentStaff as any)?._id).length === 0 && (
                    <Text style={styles.unassigned}>No other staff available</Text>
                  )}
                </View>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Assignments</Text>
              {loadingAssignments || !assignments ? (
                <ActivityIndicator color={colors.primary} />
              ) : assignments.length === 0 ? (
                <Text style={styles.unassigned}>No assignments yet</Text>
              ) : (
                <View style={styles.staffList}>

                  {assignments.map((a, index, arr) => (
                    <Pressable
                      key={a._id}
                      style={({ pressed }) => [
                        styles.staffRow,
                        pressed && { opacity: 0.7 },
                        index < arr.length - 1 && styles.staffRowBorder,
                      ]}
                      onPress={() => {
                        close();
                        router.push({
                          pathname: '/(hospital)/patient/assignment/[assignmentId]',
                          params: { assignmentId: a._id },
                        });
                      }}
                    >
                      <View style={styles.staffRowInfo}>
                        <Text style={styles.staffRowName}>{a.exerciseId?.name ?? 'Exercise'}</Text>
                        <Text style={styles.staffRowMeta}>
                          {a.customReps ?? a.exerciseId?.targetReps} reps · {a.status}
                        </Text>
                      </View>
                      <Text style={styles.assignText}>View →</Text>
                    </Pressable>
                  ))}
                </View>
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
  closeBtnText: {
    fontSize: 18,
    lineHeight: 18,
    color: colors.textGrey,
    fontWeight: '600',
  },
  content: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  infoCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.white,
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
  avatarInfo: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: typography.body,
    fontWeight: '700',
    color: colors.textDark,
  },
  meta: {
    fontSize: typography.small,
    color: colors.textGrey,
  },
  verifiedBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  verifiedBadgeActive: {
    backgroundColor: colors.success + '18',
  },
  verifiedBadgePending: {
    backgroundColor: colors.accent + '25',
  },
  verifiedBadgeText: {
    fontSize: typography.label,
    fontWeight: '700',
  },
  verifiedTextActive: {
    color: colors.success,
  },
  verifiedTextPending: {
    color: colors.accent,
  },
  actionBtn: {
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  actionBtnPrimary: {
    backgroundColor: colors.primary,
  },
  actionBtnDanger: {
    backgroundColor: colors.error,
    borderWidth: 1,
    borderColor: colors.error + '30',
  },
  actionBtnText: {
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.white,
  },
  section: {
    gap: spacing.sm,
  },
  sectionLabel: {
    fontSize: typography.label,
    fontWeight: '700',
    color: colors.textGrey,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  currentStaffCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.white,
  },
  staffAvatar: {
    width: 36,
    height: 36,
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
  },
  unassigned: {
    fontSize: typography.small,
    color: colors.accent,
    fontStyle: 'italic',
  },
  staffList: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  staffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.white,
  },
  staffRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  staffRowInfo: { flex: 1, gap: 2 },
  staffRowName: {
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.textDark,
  },
  staffRowMeta: {
    fontSize: typography.small,
    color: colors.textGrey,
  },
  assignText: {
    fontSize: typography.label,
    fontWeight: '600',
    color: colors.primary,
  },
});