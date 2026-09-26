import AssignmentSessionsView from '@/components/AssignmentSessionsView';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { useRefresh } from '@/hooks/useRefresh';
import { useStaffQuery } from '@/queries/staff';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function StaffAssignmentScreen() {
  const { assignmentId } = useLocalSearchParams<{ assignmentId: string; patientId?: string }>();
  const insets = useSafeAreaInsets();

  const assignment = useStaffQuery.patientAssignmentById(assignmentId);
  const sessions = useStaffQuery.assignmentSessionResults(assignmentId);
  const schedules = useStaffQuery.schedules(assignmentId);

  const refreshData = async () => {
    await assignment.refreshData();
    await sessions.refreshData();
    await schedules.refreshData();
  };

  const { refreshing, onRefreshControl } = useRefresh(refreshData);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Assignment details</Text>
        <View style={{ width: 48 }} />
      </View>

      <AssignmentSessionsView
        assignment={assignment.data}
        sessions={sessions.data ?? []}
        loading={sessions.loading || assignment.loading}
        canEdit={true}
        refreshing={refreshing}
        onRefresh={onRefreshControl}
        header={
          <View style={styles.headerStack}>
            {/* Schedule Gateway Card */}
            <View style={styles.scheduleGatewayCard}>
              <View>
                <Text style={styles.scheduleGatewayTitle}>Schedules</Text>
                <Text style={styles.scheduleGatewayMeta}>
                  {schedules.loading
                    ? 'Loading schedules...'
                    : `${schedules.data?.length ?? 0} active days scheduled`}
                </Text>
              </View>

              <Pressable
                style={styles.manageScheduleBtn}
                onPress={() =>
                  router.push({
                    pathname: '/(staff)/schedules/[assignmentId]',
                    params: { assignmentId },
                  })
                }
              >
                <Ionicons name="calendar-outline" size={16} color={colors.white} />
                <Text style={styles.manageScheduleBtnText}>Manage Schedule</Text>
              </Pressable>
            </View>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  headerStack: {
    marginBottom: spacing.md,
  },
  scheduleGatewayCard: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scheduleGatewayTitle: {
    fontSize: typography.body,
    fontWeight: '700',
    color: colors.textDark,
  },
  scheduleGatewayMeta: {
    fontSize: typography.small,
    color: colors.textGrey,
  },
  manageScheduleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.sm,
  },
  manageScheduleBtnText: {
    color: colors.white,
    fontSize: typography.small,
    fontWeight: '700',
  },
});