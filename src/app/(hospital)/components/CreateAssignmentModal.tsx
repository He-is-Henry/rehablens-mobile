import { colors, radius, spacing, typography } from '@/constants/theme';
import { getExercises } from '@/lib/exercise';
import { createAssignment as createHospitalAssignment } from '@/lib/hospital';
import { createAssignment as createStaffAssignment } from '@/lib/staff';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';

type Props = {
  patientId: string;
  patientName: string;
  close(): void;
  onCreated(): void;
  isPatient?: boolean
};

export default function CreateAssignmentModal({ patientId, patientName, close, onCreated, isPatient }: Props) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loadingExercises, setLoadingExercises] = useState(true);
  const [selected, setSelected] = useState<Exercise | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [customReps, setCustomReps] = useState('');
  const [customHoldSeconds, setCustomHoldSeconds] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const createAssignment = isPatient ? createStaffAssignment : createHospitalAssignment

  useEffect(() => {
    getExercises()
      .then(setExercises)
      .catch((e) => Toast.show({ type: 'error', text1: 'Failed to load exercises', text2: e.message }))
      .finally(() => setLoadingExercises(false));
  }, []);

  const handleSubmit = async () => {
    if (!selected) {
      Toast.show({ type: 'error', text1: 'Pick an exercise first' });
      return;
    }

    setSubmitting(true);
    try {
      await createAssignment({
        patientId,
        exerciseId: selected._id,
        customReps: customReps ? Number(customReps) : undefined,
        customHoldSeconds: customHoldSeconds ? Number(customHoldSeconds) : undefined,
        notes: notes || undefined,
      });
      Toast.show({ type: 'success', text1: 'Exercise assigned' });
      onCreated();
      close();
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Failed to assign', text2: e.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal transparent statusBarTranslucent animationType="fade" onRequestClose={close}>
      <Pressable style={styles.overlay} onPress={close}>
        <Pressable style={styles.card} onPress={() => { }}>

          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Assign exercise</Text>
              <Text style={styles.subtitle}>{patientName}</Text>
            </View>
            <Pressable onPress={close} hitSlop={8} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>×</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

            <Text style={styles.label}>Exercise</Text>
            {loadingExercises ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <View style={styles.exerciseList}>
                {exercises.map((ex, i) => {
                  const isSelected = selected?._id === ex._id;
                  const isExpanded = expandedId === ex._id;

                  return (
                    <View
                      key={ex._id}
                      style={i < exercises.length - 1 && styles.exerciseRowBorder}
                    >
                      <Pressable
                        style={[styles.exerciseRow, isSelected && styles.exerciseRowSelected]}
                        onPress={() => setSelected(ex)}
                      >
                        <View style={styles.exerciseRowMain}>
                          <Text style={styles.exerciseName}>{ex.name}</Text>
                          <Text style={styles.exerciseMeta}>
                            {ex.targetReps} reps · {ex.cameraOrientation} camera
                          </Text>
                        </View>

                        <Pressable
                          hitSlop={8}
                          onPress={() => setExpandedId(isExpanded ? null : ex._id)}
                          style={styles.expandBtn}
                        >
                          <Text style={styles.expandBtnText}>
                            {isExpanded ? '▲' : '▼'}
                          </Text>
                        </Pressable>
                      </Pressable>

                      {isExpanded && (
                        <View style={styles.exerciseDetail}>
                          <Text style={styles.detailText}>{ex.description}</Text>
                          <Text style={styles.detailLabel}>How to perform</Text>
                          <Text style={styles.detailText}>{ex.instructions}</Text>
                          <Text style={styles.detailLabel}>Camera positioning</Text>
                          <Text style={styles.detailText}>{ex.cameraOrientationTip}</Text>
                        </View>
                      )}
                    </View>
                  );
                })}
                {exercises.length === 0 && (
                  <Text style={styles.noResults}>No exercises available</Text>
                )}
              </View>
            )}

            <Text style={styles.label}>Custom reps (optional)</Text>
            <TextInput
              style={styles.input}
              value={customReps}
              onChangeText={setCustomReps}
              placeholder={selected ? String(selected.targetReps) : 'e.g. 10'}
              placeholderTextColor={colors.textGrey}
              keyboardType="number-pad"
            />

            <Text style={styles.label}>Custom hold seconds (optional)</Text>
            <TextInput
              style={styles.input}
              value={customHoldSeconds}
              onChangeText={setCustomHoldSeconds}
              placeholder="e.g. 2"
              placeholderTextColor={colors.textGrey}
              keyboardType="number-pad"
            />

            <Text style={styles.label}>Notes (optional)</Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Any specific instructions for this patient"
              placeholderTextColor={colors.textGrey}
              multiline
            />

          </ScrollView>

          <Pressable
            style={({ pressed }) => [
              styles.submitBtn,
              (!selected || submitting) && styles.submitBtnDisabled,
              pressed && { opacity: 0.85 },
            ]}
            onPress={handleSubmit}
            disabled={!selected || submitting}
          >
            {submitting
              ? <ActivityIndicator color={colors.white} size="small" />
              : <Text style={styles.submitBtnText}>Assign</Text>
            }
          </Pressable>

        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '85%',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: typography.subheading,
    fontWeight: '700',
    color: colors.textDark,
  },
  subtitle: {
    fontSize: typography.small,
    color: colors.textGrey,
    marginTop: 2,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.textGrey + '18',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 18,
    lineHeight: 18,
    color: colors.textGrey,
    fontWeight: '600',
  },
  content: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  label: {
    fontSize: typography.label,
    fontWeight: '700',
    color: colors.textGrey,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.xs,
  },
  exerciseList: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  exerciseRow: {
    padding: spacing.md,
    backgroundColor: colors.white,
  },
  exerciseRowSelected: {
    backgroundColor: colors.primary + '10',
  },
  exerciseRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  exerciseName: {
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.textDark,
  },
  exerciseMeta: {
    fontSize: typography.small,
    color: colors.textGrey,
    marginTop: 2,
  },
  noResults: {
    padding: spacing.md,
    fontSize: typography.small,
    color: colors.textGrey,
    textAlign: 'center',
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    fontSize: typography.body,
    color: colors.textDark,
  },
  notesInput: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.4,
  },
  submitBtnText: {
    color: colors.white,
    fontSize: typography.body,
    fontWeight: '600',
  },
  exerciseRowMain: {
    flex: 1,
  },
  expandBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  expandBtnText: {
    fontSize: 12,
    color: colors.textGrey,
  },
  exerciseDetail: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    paddingTop: spacing.xs,
    backgroundColor: colors.background,
    gap: spacing.xs,
  },
  detailLabel: {
    fontSize: typography.label,
    fontWeight: '700',
    color: colors.textGrey,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.xs,
  },
  detailText: {
    fontSize: typography.small,
    color: colors.textDark,
    lineHeight: 19,
  },
});