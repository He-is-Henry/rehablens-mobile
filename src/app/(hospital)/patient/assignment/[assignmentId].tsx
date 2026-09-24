import AssignmentSessionsView from '@/components/AssignmentSessionsView';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { useRefresh } from '@/hooks/useRefresh';
import { useHospitalQuery } from '@/queries/hospital';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HospitalAssignmentScreen() {
  const { assignmentId, linkId } = useLocalSearchParams<{
    assignmentId: string;
    linkId: string;
  }>();
  const insets = useSafeAreaInsets();

  const assignment = useHospitalQuery.assignmentById(assignmentId);
  const sessionResults = useHospitalQuery.sessionResults(assignmentId);
  const schedules = useHospitalQuery.schedules(assignmentId);
  const {
    data: link,
    loading: loadingPatient,
    refreshData: refreshPatientData,
  } = useHospitalQuery.patientByLinkId(linkId);

  const patient = link?.patientId;

  const refreshData = async () => {
    await assignment.refreshData();
    await sessionResults.refreshData();
    await refreshPatientData();
    await schedules.refreshData();
  };

  const { refreshing, onRefreshControl } = useRefresh(refreshData);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Assignment details</Text>
        <View style={{ width: 48 }} />
      </View>

      <AssignmentSessionsView
        assignment={assignment.data}
        sessions={sessionResults.data ?? []}
        loading={sessionResults.loading || assignment.loading}
        canEdit={true}
        refreshing={refreshing}
        onRefresh={onRefreshControl}
        header={
          <View style={styles.headerStack}>
            {/* Patient Info Card */}
            <View style={styles.patientCard}>
              {loadingPatient ? (
                <ActivityIndicator color={colors.primaryDark} size="small" />
              ) : patient ? (
                <>
                  <Text style={styles.patientName}>{patient.name}</Text>
                  <View style={styles.patientMetaRow}>
                    {patient.customId && (
                      <Text style={styles.patientMetaText}>ID: {patient.customId}</Text>
                    )}
                    {patient.email && (
                      <Text style={styles.patientMetaText}>{patient.email}</Text>
                    )}
                  </View>
                </>
              ) : (
                <Text style={styles.emptyText}>No patient details found</Text>
              )}
            </View>

            {/* Schedule Gateway Card */}
            <View style={styles.scheduleGatewayCard}>
              <View>
                <Text style={styles.scheduleGatewayTitle}>Schedules</Text>
                <Text style={styles.scheduleGatewayMeta}>
                  {schedules.loading
                    ? 'Loading...'
                    : `${schedules.data?.length ?? 0} active days scheduled`}
                </Text>
              </View>

              <Pressable
                style={styles.manageScheduleBtn}
                onPress={() =>
                  router.push({
                    pathname: '/(hospital)/schedules/[assignmentId]',
                    params: { assignmentId, linkId },
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
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  patientCard: {
    backgroundColor: '#fff',
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  patientMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  patientMetaText: {
    fontSize: 13,
    color: '#6B7280',
  },
  emptyText: {
    fontSize: 13,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  scheduleGatewayCard: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    fontSize: typography.small - 1,
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