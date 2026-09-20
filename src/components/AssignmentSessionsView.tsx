import { colors, radius, spacing, typography } from '@/constants/theme';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import EditAssignmentModal from './EditAssignmentModal';

type Props = {
  assignment: Assignment | null;
  sessions: SessionResult[];
  loading: boolean;
  header?: React.ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  canEdit?: boolean;
};

export default function AssignmentSessionsView({
  assignment,
  sessions = [],
  loading,
  header,
  refreshing = false,
  onRefresh,
  canEdit = false,
}: Props) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!assignment) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>Assignment not found</Text>
      </View>
    );
  }



  const exercise = assignment.exerciseId as any;
  const targetReps = assignment.customReps ?? exercise?.targetReps ?? '—';
  const holdSeconds = assignment.customHoldSeconds ?? exercise?.holdSeconds ?? '—';
  const completedSessions = sessions.filter((s) => s.status === 'completed').length;
  const totalReps = sessions.reduce((sum, s) => sum + s.repsCompleted, 0);

  return (
    <>
      <FlatList
        data={sessions}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.content}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          ) : undefined
        }
        ListHeaderComponent={
          <>
            {header}

            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionLabel}>Assignment</Text>
                {canEdit && (
                  <Pressable onPress={() => setIsEditModalOpen(true)} hitSlop={8}>
                    <Text style={styles.editButtonText}>Edit</Text>
                  </Pressable>
                )}
              </View>

              <View style={styles.card}>
                <InfoRow label="Exercise" value={exercise?.name ?? '—'} />
                <Divider />
                <InfoRow label="Target reps" value={String(targetReps)} />
                <Divider />
                <InfoRow label="Hold duration" value={`${holdSeconds}s`} />
                <Divider />
                <InfoRow label="Status" value={assignment.status} />
                {assignment.notes && (
                  <>
                    <Divider />
                    <InfoRow label="Notes" value={assignment.notes} />
                  </>
                )}
              </View>
            </View>

            <View style={styles.statsRow}>
              <StatBox label="Sessions" value={String(sessions.length)} sub="total" />
              <StatBox label="Completed" value={String(completedSessions)} sub="sessions" />
              <StatBox label="Total reps" value={String(totalReps)} sub="done" />
            </View>

            <Text style={styles.sectionLabel}>Session history</Text>

            {sessions.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyLabel}>No sessions yet</Text>
                <Text style={styles.emptySub}>
                  Sessions will appear here once the patient starts exercising
                </Text>
              </View>
            )}
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.sessionCard}>
            <View style={styles.sessionCardTop}>
              <View
                style={[
                  styles.sessionStatus,
                  item.status === 'completed'
                    ? styles.sessionStatusDone
                    : styles.sessionStatusAbandoned,
                ]}
              >
                <Text
                  style={[
                    styles.sessionStatusText,
                    item.status === 'completed'
                      ? styles.sessionStatusTextDone
                      : styles.sessionStatusTextAbandoned,
                  ]}
                >
                  {item.status === 'completed' ? 'Completed' : 'Abandoned'}
                </Text>
              </View>
              <Text style={styles.sessionDate}>
                {new Date(item.completedAt).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
            </View>
            <View style={styles.sessionStats}>
              <Text style={styles.sessionStat}>
                {item.repsCompleted}/{item.targetReps} reps
              </Text>
              <Text style={styles.sessionStat}>
                {Math.round(item.durationSeconds / 60)}m {item.durationSeconds % 60}s
              </Text>
            </View>
          </View>
        )}
      />

      {canEdit && (
        <EditAssignmentModal
          visible={isEditModalOpen}
          assignment={assignment}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={() => onRefresh?.()}
        />
      )}
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

function StatBox({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statSub}>{sub}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFound: {
    fontSize: typography.body,
    color: colors.textGrey,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  section: {
    gap: spacing.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionLabel: {
    fontSize: typography.label,
    fontWeight: '700',
    color: colors.textGrey,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  editButtonText: {
    fontSize: typography.small,
    fontWeight: '700',
    color: colors.primary,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    gap: spacing.md,
  },
  infoLabel: {
    fontSize: typography.small,
    color: colors.textGrey,
    fontWeight: '500',
    flex: 1,
  },
  infoValue: {
    fontSize: typography.small,
    color: colors.textDark,
    fontWeight: '600',
    flex: 2,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  statLabel: {
    fontSize: typography.small,
    fontWeight: '600',
    color: colors.textDark,
  },
  statSub: {
    fontSize: typography.label,
    color: colors.textGrey,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.xs,
  },
  emptyLabel: {
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.textDark,
  },
  emptySub: {
    fontSize: typography.small,
    color: colors.textGrey,
    textAlign: 'center',
  },
  sessionCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  sessionCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionStatus: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  sessionStatusDone: {
    backgroundColor: colors.success + '18',
  },
  sessionStatusAbandoned: {
    backgroundColor: colors.error + '12',
  },
  sessionStatusText: {
    fontSize: typography.label,
    fontWeight: '700',
  },
  sessionStatusTextDone: {
    color: colors.success,
  },
  sessionStatusTextAbandoned: {
    color: colors.error,
  },
  sessionDate: {
    fontSize: typography.small,
    color: colors.textGrey,
    fontWeight: '500',
  },
  sessionStats: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  sessionStat: {
    fontSize: typography.small,
    color: colors.textDark,
    fontWeight: '600',
  },
});