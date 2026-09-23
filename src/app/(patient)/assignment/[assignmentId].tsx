import AssignmentSessionsView from '@/components/AssignmentSessionsView';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { usePatientQuery } from '@/queries/patient';
import { router, useLocalSearchParams } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PatientAssignmentDetail() {
  const { assignmentId } = useLocalSearchParams<{ assignmentId: string }>();
  const insets = useSafeAreaInsets();

  const sessionsQuery = usePatientQuery.sessionResults(assignmentId);
  const assignmentQuery = usePatientQuery.assignmentById(assignmentId);

  const assignment = assignmentQuery.data;
  const isActive = assignment?.status === 'active';

  const { data: links, loading: linkLoading } = usePatientQuery.hospitals({ revalidate: false });

  const findLinkId = (assignment: Assignment | null) => {
    const hospitalId = typeof assignment?.hospitalId === 'object' ? assignment.hospitalId?._id : assignment?.hospitalId;
    return links?.find(l => l.hospitalId._id === hospitalId);
  };

  const link = findLinkId(assignment)

  const isVerified = link?.verified ?? false;
  const canStart = isActive && isVerified;

  const handleStart = () => {
    if (!isVerified) {
      Alert.alert(
        'Link Unverified',
        'Your connection to this hospital has not been verified yet. Please wait for verification before starting exercises.',
      );
      return;
    }

    Alert.alert(
      'Start exercise?',
      `You're about to start "${assignment?.exerciseId?.name}". Make sure you're ready and have space to move.`,
      [
        { text: 'Not now', style: 'cancel' },
        {
          text: 'Start',
          onPress: () => router.push(`/(patient)/exercise/${assignmentId}`),
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Exercise history</Text>
      </View>

      {/* Unverified Warning Banner */}
      {!linkLoading && link && !isVerified && (
        <View style={styles.warningBanner}>
          <Text style={styles.warningTitle}>Verification Pending</Text>
          <Text style={styles.warningText}>
            This hospital link is pending verification. You can view your session history, but exercise tracking is locked until verified.
          </Text>
        </View>
      )}

      <AssignmentSessionsView
        assignment={assignmentQuery.data}
        sessions={sessionsQuery.data ?? []}
        loading={assignmentQuery.loading || sessionsQuery.loading || linkLoading}
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <Pressable
          style={({ pressed }) => [
            styles.startBtn,
            !canStart && styles.disabledBtn,
            pressed && canStart && { opacity: 0.85 },
          ]}
          onPress={handleStart}
          disabled={!canStart}
        >
          <Text style={styles.startBtnText}>
            {!isVerified ? 'Verification Pending' : 'Start Exercise'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primaryDark,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  backText: { fontSize: typography.small, color: 'rgba(255,255,255,0.7)', fontWeight: '500' },
  title: { fontSize: typography.subheading, fontWeight: '700', color: colors.white },
  warningBanner: {
    backgroundColor: '#fffbe3',
    borderColor: '#ffe58f',
    borderWidth: 1,
    margin: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  warningTitle: {
    fontSize: typography.body,
    fontWeight: '700',
    color: '#873800',
    marginBottom: 4,
  },
  warningText: {
    fontSize: typography.small,
    color: '#612500',
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  startBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  disabledBtn: {
    opacity: 0.4,
  },
  startBtnText: {
    color: colors.white,
    fontSize: typography.body,
    fontWeight: '700',
  },
});