import { colors, radius, spacing, typography } from '@/constants/theme';
import { deleteExercise, restoreExercise } from '@/lib/exercise';
import { useExerciseQuery } from '@/queries/exercise';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import ExerciseFormModal from '../components/ExerciseFormModal';

type Mode = 'active' | 'deleted';

export default function ExerciseCmsScreen() {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<Mode>('active');

  const activeQuery = useExerciseQuery.getExercises();
  const deletedQuery = useExerciseQuery.getDeletedExercises();

  const current = mode === 'active' ? activeQuery : deletedQuery;
  const { data: exercises, setData, loading, refreshData } = current;

  const [formTarget, setFormTarget] = useState<Exercise | null | 'new'>(null);

  const handleSaved = (saved: Exercise) => {
    activeQuery.setData((prev) => {
      const list = prev ?? [];
      const exists = list.some((e) => e._id === saved._id);
      return exists ? list.map((e) => (e._id === saved._id ? saved : e)) : [...list, saved];
    });
  };

  const handleDelete = (exercise: Exercise) => {
    Alert.alert('Delete exercise?', `"${exercise.name}" will be hidden from new assignments.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteExercise(exercise._id);
            setData((prev) => (prev ?? []).filter((e) => e._id !== exercise._id));
            Toast.show({ type: 'success', text1: 'Exercise deleted' });
          } catch (e: any) {
            Toast.show({ type: 'error', text1: 'Delete failed', text2: e.message });
          }
        },
      },
    ]);
  };

  const handleRestore = async (exercise: Exercise) => {
    try {
      await restoreExercise(exercise._id);
      setData((prev) => (prev ?? []).filter((e) => e._id !== exercise._id));
      activeQuery.setData((prev) => [...(prev ?? []), exercise]);
      Toast.show({ type: 'success', text1: 'Exercise restored' });
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Restore failed', text2: e.message });
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Text style={styles.title}>Exercise Library</Text>
        <Text style={styles.subtitle}>
          {mode === 'active' ? `${exercises?.length ?? 0} active exercises` : 'Archived exercises'}
        </Text>
      </View>

      {/* Segmented Control */}
      <View style={styles.tabContainer}>
        <View style={styles.segmentedControl}>
          {(['active', 'deleted'] as const).map((m) => (
            <Pressable
              key={m}
              style={[styles.segmentBtn, mode === m && styles.segmentBtnActive]}
              onPress={() => setMode(m)}
            >
              <Text style={[styles.segmentText, mode === m && styles.segmentTextActive]}>
                {m === 'active' ? 'Active' : 'Deleted'}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Main Content / List */}
      {loading && !exercises ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={exercises}
          keyExtractor={(item) => item._id}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: insets.bottom + spacing.xl * 2 },
          ]}
          refreshing={loading}
          onRefresh={refreshData}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons
                  name={mode === 'active' ? 'barbell-outline' : 'trash-outline'}
                  size={32}
                  color={colors.textGrey}
                />
              </View>
              <Text style={styles.emptyTitle}>
                {mode === 'active' ? 'No exercises found' : 'Trash is empty'}
              </Text>
              <Text style={styles.emptySubtext}>
                {mode === 'active'
                  ? 'Tap the button below to add your first exercise.'
                  : 'Deleted exercises will appear here.'}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardMain}>
                <Text style={styles.cardName} numberOfLines={1}>
                  {item.name}
                </Text>

                {/* Badges / Chips */}
                <View style={styles.chipsRow}>
                  <View style={styles.chip}>
                    <Ionicons name="repeat-outline" size={12} color={colors.textDark} />
                    <Text style={styles.chipText}>{item.targetReps} reps</Text>
                  </View>

                  <View style={styles.chip}>
                    <Ionicons name="time-outline" size={12} color={colors.textDark} />
                    <Text style={styles.chipText}>{item.holdSeconds}s hold</Text>
                  </View>

                  <View style={[styles.chip, styles.chipOrientation]}>
                    <Ionicons name="camera-outline" size={12} color={colors.primary} />
                    <Text style={[styles.chipText, { color: colors.primary }]}>
                      {item.cameraOrientation}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.cardActions}>
                {mode === 'active' ? (
                  <>
                    <Pressable
                      style={styles.actionBtn}
                      onPress={() => setFormTarget(item)}
                      hitSlop={8}
                    >
                      <Ionicons name="create-outline" size={18} color={colors.primary} />
                    </Pressable>
                    <Pressable
                      style={[styles.actionBtn, styles.deleteActionBtn]}
                      onPress={() => handleDelete(item)}
                      hitSlop={8}
                    >
                      <Ionicons name="trash-outline" size={18} color={colors.error} />
                    </Pressable>
                  </>
                ) : (
                  <Pressable
                    style={styles.restoreBtn}
                    onPress={() => handleRestore(item)}
                    hitSlop={8}
                  >
                    <Ionicons name="refresh-outline" size={14} color={colors.primary} />
                    <Text style={styles.restoreText}>Restore</Text>
                  </Pressable>
                )}
              </View>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        />
      )}

      {/* Floating Action Button */}
      {mode === 'active' && (
        <Pressable
          style={({ pressed }) => [
            styles.fab,
            { bottom: insets.bottom + spacing.lg },
            pressed && { opacity: 0.9, transform: [{ scale: 0.96 }] },
          ]}
          onPress={() => setFormTarget('new')}
        >
          <Ionicons name="add" size={28} color={colors.white} />
        </Pressable>
      )}

      {/* Exercise Modal */}
      {formTarget && (
        <ExerciseFormModal
          exercise={formTarget === 'new' ? null : formTarget}
          close={() => setFormTarget(null)}
          onSaved={handleSaved}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primaryDark,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  title: { color: colors.white, fontSize: typography.subheading, fontWeight: '700' },
  subtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: typography.small,
    marginTop: 2,
  },
  tabContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: colors.border + '60',
    borderRadius: radius.md,
    padding: 3,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: spacing.xs + 2,
    alignItems: 'center',
    borderRadius: radius.md - 2,
  },
  segmentBtnActive: {
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: typography.small,
    color: colors.textGrey,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: colors.textDark,
    fontWeight: '700',
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: spacing.lg },

  /* Card Component */
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardMain: { flex: 1, gap: spacing.xs, marginRight: spacing.sm },
  cardName: { fontSize: typography.body, fontWeight: '700', color: colors.textDark },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 2 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipOrientation: {
    backgroundColor: colors.primary + '10',
    borderColor: colors.primary + '30',
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textDark,
    textTransform: 'capitalize',
  },
  cardActions: { flexDirection: 'row', gap: spacing.xs, alignItems: 'center' },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteActionBtn: {
    backgroundColor: colors.error + '10',
  },
  restoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
  },
  restoreText: { fontSize: typography.small, color: colors.primary, fontWeight: '700' },

  /* Empty State */
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 1.5,
    paddingHorizontal: spacing.lg,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: colors.border + '50',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: { fontSize: typography.body, fontWeight: '700', color: colors.textDark },
  emptySubtext: {
    fontSize: typography.small,
    color: colors.textGrey,
    textAlign: 'center',
    marginTop: 4,
  },

  /* FAB */
  fab: {
    position: 'absolute',
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
  },
});