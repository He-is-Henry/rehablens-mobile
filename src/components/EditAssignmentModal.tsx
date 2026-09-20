import { colors, radius, spacing, typography } from '@/constants/theme';
import { updateHospitalAssignment } from '@/lib/hospital';
import { updateStaffAssignment } from '@/lib/staff';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export type AssignmentStatus = 'active' | 'completed' | 'paused' | 'archived';

const STATUS_OPTIONS: AssignmentStatus[] = ['active', 'paused', 'completed', 'archived'];

type Props = {
  visible: boolean;
  assignment: Assignment;
  role?: 'hospital' | 'staff';
  onClose: () => void;
  onSuccess: () => void;
  onUpdate?: (payload: any) => Promise<void>;
};

export default function EditAssignmentModal({
  visible,
  assignment,
  role = 'hospital',
  onClose,
  onSuccess,
  onUpdate,
}: Props) {
  const [status, setStatus] = useState<AssignmentStatus>(
    (assignment.status as AssignmentStatus) ?? 'active'
  );
  const [customReps, setCustomReps] = useState('');
  const [customHoldSeconds, setCustomHoldSeconds] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (assignment) {
      setStatus((assignment.status as AssignmentStatus) ?? 'active');
      setCustomReps(assignment.customReps !== undefined ? String(assignment.customReps) : '');
      setCustomHoldSeconds(
        assignment.customHoldSeconds !== undefined ? String(assignment.customHoldSeconds) : ''
      );
      setNotes(assignment.notes ?? '');
    }
  }, [assignment, visible]);

  const handleSave = async () => {
    setSubmitting(true);
    const payload = {
      status,
      customReps: customReps.trim() !== '' ? Number(customReps) : undefined,
      customHoldSeconds: customHoldSeconds.trim() !== '' ? Number(customHoldSeconds) : undefined,
      notes: notes.trim(),
    };

    try {
      if (onUpdate) {
        await onUpdate(payload);
      } else if (role === 'staff') {
        await updateStaffAssignment(assignment._id, payload);
      } else {
        await updateHospitalAssignment(assignment._id, payload);
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      Alert.alert('Error', error?.message ?? 'Failed to update assignment details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <Text style={styles.title}>Edit Assignment</Text>

          {/* Status Pills */}
          <Text style={styles.label}>Status</Text>
          <View style={styles.pillContainer}>
            {STATUS_OPTIONS.map((item) => {
              const selected = status === item;
              return (
                <Pressable
                  key={item}
                  onPress={() => setStatus(item)}
                  style={[styles.pill, selected && styles.pillSelected]}
                >
                  <Text style={[styles.pillText, selected && styles.pillTextSelected]}>
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Target Reps Input */}
          <Text style={styles.label}>Custom Target Reps</Text>
          <TextInput
            style={styles.input}
            value={customReps}
            onChangeText={setCustomReps}
            placeholder="e.g. 10"
            keyboardType="number-pad"
            placeholderTextColor={colors.textGrey}
          />

          {/* Hold Duration Input */}
          <Text style={styles.label}>Custom Hold Duration (seconds)</Text>
          <TextInput
            style={styles.input}
            value={customHoldSeconds}
            onChangeText={setCustomHoldSeconds}
            placeholder="e.g. 5"
            keyboardType="number-pad"
            placeholderTextColor={colors.textGrey}
          />

          {/* Notes Input */}
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add special instructions..."
            multiline
            numberOfLines={3}
            placeholderTextColor={colors.textGrey}
          />

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <Pressable
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={submitting}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>

            <Pressable
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    fontSize: typography.body,
    fontWeight: '700',
    color: colors.textDark,
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: typography.small,
    fontWeight: '600',
    color: colors.textGrey,
    marginTop: spacing.xs,
  },
  pillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  pillSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pillText: {
    fontSize: typography.small,
    color: colors.textDark,
    fontWeight: '500',
  },
  pillTextSelected: {
    color: colors.white,
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.small,
    color: colors.textDark,
    backgroundColor: colors.white,
  },
  multilineInput: {
    height: 70,
    textAlignVertical: 'top',
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    fontSize: typography.small,
    color: colors.textDark,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    fontSize: typography.small,
    color: colors.white,
    fontWeight: '700',
  },
});