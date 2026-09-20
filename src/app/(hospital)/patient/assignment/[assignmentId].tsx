import AssignmentSessionsView from '@/components/AssignmentSessionsView';
import { colors, spacing } from '@/constants/theme';
import { useRefresh } from '@/hooks/useRefresh';
import { useHospitalQuery } from '@/queries/hospital';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HospitalAssignmentScreen() {
  const { assignmentId, linkId } = useLocalSearchParams<{ assignmentId: string; linkId: string }>();
  const insets = useSafeAreaInsets();

  const assignment = useHospitalQuery.assignmentById(assignmentId);
  const sessionResults = useHospitalQuery.sessionResults(assignmentId);
  const { data: link, loading: loadingPatient, refreshData: refreshPatientData } =
    useHospitalQuery.patientByLinkId(linkId);

  const patient = link?.patientId;

  const refreshData = async () => {
    await assignment.refreshData();
    await sessionResults.refreshData();
    await refreshPatientData();
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
        sessions={sessionResults.data ?? []}
        loading={sessionResults.loading || assignment.loading}
        canEdit={true}
        role="hospital"
        refreshing={refreshing}
        onRefresh={onRefreshControl}
        onDeleteSuccess={() => router.back()}
        header={
          <View style={styles.patientCard}>
            {loadingPatient ? (
              <ActivityIndicator color={colors.primaryDark} size="small" />
            ) : patient ? (
              <>
                <Text style={styles.patientName}>{patient.name}</Text>
                <View style={styles.patientMetaRow}>
                  {patient.customId && <Text style={styles.patientMetaText}>ID: {patient.customId}</Text>}
                  {patient.email && <Text style={styles.patientMetaText}>{patient.email}</Text>}
                </View>
              </>
            ) : (
              <Text style={styles.emptyText}>No patient details found</Text>
            )}
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
  patientCard: {
    backgroundColor: '#fff',
    marginBottom: spacing.md,
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
});