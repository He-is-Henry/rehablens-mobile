import AssignmentSessionsView from '@/components/AssignmentSessionsView';
import { colors, spacing } from '@/constants/theme';
import { useHospitalQuery } from '@/queries/hospital';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HospitalAssignmentScreen() {
  const { assignmentId } = useLocalSearchParams<{ assignmentId: string }>();
  const insets = useSafeAreaInsets();

  const assignment = useHospitalQuery.assignmentById(assignmentId);
  const sessionResults = useHospitalQuery.sessionResults(assignmentId);

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
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: colors.background
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
    width: 48
  },
  headerTitle: {
    color: '#fff',
    fontSize: 14, fontWeight: '700',
    flex: 1,
    textAlign: 'center'
  },
});