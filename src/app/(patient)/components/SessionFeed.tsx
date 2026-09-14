import { colors, radius, spacing, typography } from '@/constants/theme';
import { useRefresh } from '@/hooks/useRefresh';
import { usePatientQuery } from '@/queries/patient';
import { router } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

export default function SessionFeed() {
  const { data: sessions, loading, refreshData: loadSessions } = usePatientQuery.allSessionResults();

  const { refreshing, onRefreshControl } = useRefresh(loadSessions)


  if (loading) {
    return <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.lg }} />;
  }

  if (sessions?.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No exercise sessions yet</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={sessions}
      keyExtractor={(item) => item._id}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefreshControl} />}
      renderItem={({ item }) => (
        <Pressable onPress={() => router.push(`/(patient)/assignment/${item.assignmentId._id}`)}
          style={({ pressed }) => pressed && { opacity: 0.85 }}
        > <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.name} numberOfLines={1}>
                {item.assignmentId.exerciseId.name}
              </Text>
              <Text style={styles.date}>
                {new Date(item.completedAt).toLocaleDateString('en-GB', {
                  day: 'numeric', month: 'short',
                })}
              </Text>
            </View>
            <Text style={styles.meta}>
              {item.repsCompleted}/{item.targetReps} reps ·{' '}
              {item.status === 'completed' ? 'Completed' : 'Abandoned'}
            </Text>
          </View></Pressable>
      )}
      ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
    />
  );
}


const styles = StyleSheet.create({
  list: { paddingTop: spacing.xs },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  name: {
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.textDark,
    flex: 1,
  },
  date: {
    fontSize: typography.small,
    color: colors.textGrey
  },
  meta: {
    fontSize: typography.small,
    color: colors.textGrey
  },
  empty: {
    paddingVertical: spacing.lg,
    alignItems: 'center'
  },
  emptyText: {
    fontSize: typography.small,
    color: colors.textGrey
  },
});