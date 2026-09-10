import AssignmentSessionsView from '@/components/AssignmentSessionsView';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { getPatientAssignmentById, getPatientSessionResultsByAssignment } from '@/lib/patient';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PatientAssignmentDetail() {
  const { assignmentId } = useLocalSearchParams<{ assignmentId: string }>();
  const insets = useSafeAreaInsets();
  const [assignment, setAssignment] = useState<Assignment | null>(null);

  const handleStart = () => {
    Alert.alert(
      'Start exercise?',
      `You're about to start "${assignment?.exerciseId.name}". Make sure you're ready and have space to move.`,
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

      <AssignmentSessionsView
        fetchAssignment={() => getPatientAssignmentById(assignmentId).then((a) => {
          setAssignment(a);
          return a;
        })}
        fetchSessions={() => getPatientSessionResultsByAssignment(assignmentId)}
      />

      {assignment?.status === 'active' && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
          <Pressable
            style={({ pressed }) => [styles.startBtn, pressed && { opacity: 0.85 }]}
            onPress={handleStart}
          >
            <Text style={styles.startBtnText}>Start again</Text>
          </Pressable>
        </View>
      )}
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
  startBtnText: { color: colors.white, fontSize: typography.body, fontWeight: '700' },
});