import { colors, radius, spacing, typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';

type ScheduleSlotCardProps = {
  slot: {
    _id: string;
    scheduledDate: string;
    minSessions: number;
    maxSessions: number;
  };
  onUpdate: (
    slotId: string,
    data: { scheduledDate: string; minSessions: number; maxSessions: number }
  ) => Promise<void>;
  onDelete: (slotId: string) => Promise<void>;
};

export function parseDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}


const formatDateString = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function ScheduleSlotCard({
  slot,
  onUpdate,
  onDelete,
}: ScheduleSlotCardProps) {
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [selectedDate, setSelectedDate] = useState<Date>(parseDateString(slot.scheduledDate));
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [minSessions, setMinSessions] = useState(String(slot.minSessions));
  const [maxSessions, setMaxSessions] = useState(String(slot.maxSessions));

  const handleDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleSave = async () => {
    const min = parseInt(minSessions, 10) || 1;
    const max = Math.max(min, parseInt(maxSessions, 10) || min);
    const dateStr = formatDateString(selectedDate);

    try {
      setLoading(true);
      await onUpdate(slot._id, {
        scheduledDate: dateStr,
        minSessions: min,
        maxSessions: max,
      });
      setIsEditing(false);
      Toast.show({
        type: 'success',
        text1: 'Schedule Updated',
        text2: 'Slot details updated successfully.',
      });
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: err?.message || 'Failed to update schedule slot.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedDate(parseDateString(slot.scheduledDate));
    setMinSessions(String(slot.minSessions));
    setMaxSessions(String(slot.maxSessions));
    setShowDatePicker(false);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await onDelete(slot._id);
      Toast.show({
        type: 'success',
        text1: 'Slot Deleted',
        text2: 'Schedule slot removed.',
      });
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Delete Failed',
        text2: err?.message || 'Could not delete slot.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.card}>
      {isEditing ? (
        <View style={styles.editForm}>
          <Text style={styles.label}>Scheduled Date</Text>
          <Pressable
            style={styles.datePickerBtn}
            onPress={() => setShowDatePicker(true)}
            hitSlop={6}
          >
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            <Text style={styles.datePickerBtnText}>
              {formatDateString(selectedDate)}
            </Text>
          </Pressable>

          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Min Sessions</Text>
              <TextInput
                style={styles.input}
                value={minSessions}
                onChangeText={setMinSessions}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Max Sessions</Text>
              <TextInput
                style={styles.input}
                value={maxSessions}
                onChangeText={setMaxSessions}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.editActions}>
            <Pressable
              style={[styles.btn, styles.cancelBtn]}
              onPress={handleCancel}
              disabled={loading}
              hitSlop={8}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.btn, styles.saveBtn]}
              onPress={handleSave}
              disabled={loading}
              hitSlop={8}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveText}>Save</Text>
              )}
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={styles.viewRow}>
          <View style={styles.infoCol}>
            <Text style={styles.dateText}>{slot.scheduledDate}</Text>
            <Text style={styles.metaText}>
              Target: {slot.minSessions} - {slot.maxSessions} sessions
            </Text>
          </View>

          {loading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <View style={styles.actionsRow}>
              <Pressable
                style={styles.iconBtn}
                onPress={() => setIsEditing(true)}
                hitSlop={10}
              >
                <Ionicons name="create-outline" size={22} color={colors.primary} />
              </Pressable>

              <Pressable
                style={styles.iconBtn}
                onPress={handleDelete}
                hitSlop={10}
              >
                <Ionicons name="trash-outline" size={22} color={colors.accent} />
              </Pressable>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xs,
  },
  viewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 44,
  },
  infoCol: {
    gap: 4,
    flex: 1,
  },
  dateText: {
    fontSize: typography.body,
    fontWeight: '700',
    color: colors.textDark,
  },
  metaText: {
    fontSize: typography.small - 1,
    color: colors.textGrey,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconBtn: {
    padding: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editForm: {
    gap: spacing.sm,
  },
  label: {
    fontSize: typography.small - 1,
    fontWeight: '600',
    color: colors.textDark,
  },
  datePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    backgroundColor: colors.background,
    minHeight: 44,
  },
  datePickerBtnText: {
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.textDark,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.body,
    backgroundColor: colors.background,
    minHeight: 44,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  col: {
    flex: 1,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  btn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.sm,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  saveBtn: {
    backgroundColor: colors.primary,
  },
  cancelText: {
    fontSize: typography.small,
    color: colors.textDark,
    fontWeight: '600',
  },
  saveText: {
    fontSize: typography.small,
    color: colors.white,
    fontWeight: '700',
  },
});