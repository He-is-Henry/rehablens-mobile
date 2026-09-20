import AssignmentSessionsView from '@/components/AssignmentSessionsView';
import { colors, spacing } from '@/constants/theme';
import { useRefresh } from '@/hooks/useRefresh';
import { useStaffQuery } from '@/queries/staff';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function StaffAssignmentScreen() {
  const { assignmentId } = useLocalSearchParams<{ assignmentId: string; patientId: string }>();
  const insets = useSafeAreaInsets();

  const assignment = useStaffQuery.patientAssignmentById(assignmentId);
  const sessions = useStaffQuery.assignmentSessionResults(assignmentId);

  const refreshData = async () => {
    await assignment.refreshData();
    await sessions.refreshData();
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
        role="staff"
        refreshing={refreshing}
        onRefresh={onRefreshControl}
        onDeleteSuccess={() => router.back()}
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
});