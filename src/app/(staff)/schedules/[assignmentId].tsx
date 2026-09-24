import CreateScheduleModal from '@/components/CreateScheduleModal';
import ScheduleSlotCard from '@/components/ScheduleSlotCard';
import { colors, radius, spacing, typography } from '@/constants/theme';
import {
  createStaffSchedules,
  deleteStaffSchedule,
  updateStaffSchedule,
} from '@/lib/staff';
import { useStaffQuery } from '@/queries/staff';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function StaffScheduleManagementScreen() {
  const { assignmentId } = useLocalSearchParams<{ assignmentId: string }>();
  const insets = useSafeAreaInsets();
  const [showGenerator, setShowGenerator] = useState(false);

  const { data: assignment, loading: loadingAssignment } = useStaffQuery.patientAssignmentById(assignmentId);
  const {
    data: schedules,
    loading: loadingSchedules,
    refreshData: refreshSchedules,
  } = useStaffQuery.schedules(assignmentId);

  const monthlyGroups = useMemo(() => {
    if (!schedules) return [];

    const map = new Map<string, { key: string; label: string; slots: typeof schedules }>();

    schedules.forEach((slot) => {
      const d = new Date(slot.scheduledDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

      if (!map.has(key)) {
        map.set(key, { key, label, slots: [] });
      }
      map.get(key)!.slots.push(slot);
    });

    return Array.from(map.values()).sort((a, b) => a.key.localeCompare(b.key));
  }, [schedules]);

  const [collapsedMap, setCollapsedMap] = useState<Record<string, boolean>>({});

  const toggleMonth = (key: string) => {
    setCollapsedMap((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCreateSchedules = async (
    entries: { scheduledDate: string; minSessions: number; maxSessions: number }[],
  ) => {
    if (!assignmentId) return;
    await createStaffSchedules(assignmentId, entries);
    refreshSchedules();
  };

  const handleUpdateSlot = async (
    slotId: string,
    data: {
      scheduledDate: string,
      minSessions: number,
      maxSessions: number,

    }
  ) => {
    const { scheduledDate, minSessions, maxSessions } = data
    await updateStaffSchedule(slotId, { minSessions, maxSessions, scheduledDate });
    refreshSchedules();
  };

  const handleDeleteSlot = async (slotId: string) => {
    Alert.alert('Delete Slot', 'Are you sure you want to delete this scheduled date?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteStaffSchedule(slotId);
            refreshSchedules();
          } catch (err: any) {
            Alert.alert('Error', err?.message ?? 'Failed to delete schedule slot');
          }
        },
      },
    ]);
  };

  const totalMinSessions = schedules?.reduce((acc, s) => acc + s.minSessions, 0) ?? 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Staff Schedule Management</Text>
        <View style={{ width: 48 }} />
      </View>

      {/* Program Context Header */}
      <View style={styles.contextCard}>
        {loadingAssignment ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Text style={styles.exerciseName}>
            Exercise: {assignment?.exerciseId?.name ?? 'Custom Program'}
          </Text>
        )}
      </View>

      {/* Actions & Summary Bar */}
      <View style={styles.summaryBar}>
        <View>
          <Text style={styles.summaryTitle}>{schedules?.length ?? 0} Scheduled Days</Text>
          <Text style={styles.summarySubtitle}>{totalMinSessions} total target sessions</Text>
        </View>

        <Pressable style={styles.generateBtn} onPress={() => setShowGenerator(true)}>
          <Ionicons name="sparkles-outline" size={16} color={colors.white} />
          <Text style={styles.generateBtnText}>Generate</Text>
        </Pressable>
      </View>

      {/* Schedule List (Monthly Accordions) */}
      {loadingSchedules ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : monthlyGroups.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={48} color={colors.textGrey} />
          <Text style={styles.emptyTitle}>No Schedules Found</Text>
          <Text style={styles.emptySub}>
            Tap "Generate" above to create scheduled days for this patient assignment.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.listContent}>
          {monthlyGroups.map((group) => {
            const isCollapsed = !!collapsedMap[group.key];
            return (
              <View key={group.key} style={styles.monthSection}>
                <Pressable
                  style={styles.monthHeader}
                  onPress={() => toggleMonth(group.key)}
                >
                  <View style={styles.monthHeaderTitleRow}>
                    <Ionicons name="calendar-outline" size={18} color={colors.primary} />
                    <Text style={styles.monthHeaderTitle}>{group.label}</Text>
                    <View style={styles.monthCountBadge}>
                      <Text style={styles.monthCountText}>{group.slots.length} days</Text>
                    </View>
                  </View>
                  <Ionicons
                    name={isCollapsed ? 'chevron-down-outline' : 'chevron-up-outline'}
                    size={18}
                    color={colors.textGrey}
                  />
                </Pressable>

                {!isCollapsed && (
                  <View style={styles.monthBody}>
                    {group.slots.map((slot) => (
                      <ScheduleSlotCard
                        key={slot._id}
                        slot={slot}
                        onUpdate={handleUpdateSlot}
                        onDelete={handleDeleteSlot}
                      />
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Generator Modal */}
      <CreateScheduleModal
        visible={showGenerator}
        onClose={() => setShowGenerator(false)}
        onSubmit={handleCreateSchedules}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: colors.primaryDark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  backText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    width: 48,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  contextCard: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  exerciseName: {
    fontSize: typography.body,
    color: colors.primary,
    fontWeight: '700',
  },
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    marginTop: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  summaryTitle: {
    fontSize: typography.body,
    fontWeight: '700',
    color: colors.textDark,
  },
  summarySubtitle: {
    fontSize: typography.small - 1,
    color: colors.textGrey,
  },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.sm,
  },
  generateBtnText: {
    color: colors.white,
    fontSize: typography.small,
    fontWeight: '700',
  },
  listContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  monthSection: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.primary + '08',
  },
  monthHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  monthHeaderTitle: {
    fontSize: typography.body,
    fontWeight: '700',
    color: colors.textDark,
  },
  monthCountBadge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  monthCountText: {
    fontSize: typography.small - 2,
    fontWeight: '700',
    color: colors.primary,
  },
  monthBody: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.xs,
  },
  emptyTitle: {
    fontSize: typography.subheading,
    fontWeight: '700',
    color: colors.textDark,
  },
  emptySub: {
    fontSize: typography.small,
    color: colors.textGrey,
    textAlign: 'center',
  },
});