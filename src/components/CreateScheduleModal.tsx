import { colors, radius, spacing, typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (
    entries: { scheduledDate: string; minSessions: number; maxSessions: number }[],
  ) => Promise<void>;
};

const WEEKDAYS = [
  { label: 'Sun', value: 0 },
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
];

export default function CreateScheduleModal({ visible, onClose, onSubmit }: Props) {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d;
  });

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [minSessions, setMinSessions] = useState(1);
  const [maxSessions, setMaxSessions] = useState(2);
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [submitting, setSubmitting] = useState(false);

  const toggleDay = (dayValue: number) => {
    setSelectedDays((prev) =>
      prev.includes(dayValue)
        ? prev.filter((d) => d !== dayValue)
        : [...prev, dayValue].sort((a, b) => a - b),
    );
  };

  const onStartDateChange = (event: DateTimePickerEvent, date?: Date) => {
    setShowStartPicker(Platform.OS === 'ios');
    if (date) {
      setStartDate(date);
      if (date > endDate) setEndDate(date);
    }
  };

  const onEndDateChange = (event: DateTimePickerEvent, date?: Date) => {
    setShowEndPicker(Platform.OS === 'ios');
    if (date) setEndDate(date);
  };

  const generatedDates = useMemo(() => {
    const dates: string[] = [];
    const current = new Date(startDate);
    current.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    while (current <= end) {
      if (selectedDays.includes(current.getDay())) {
        const yyyy = current.getFullYear();
        const mm = String(current.getMonth() + 1).padStart(2, '0');
        const dd = String(current.getDate()).padStart(2, '0');
        dates.push(`${yyyy}-${mm}-${dd}`);
      }
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }, [startDate, endDate, selectedDays]);

  const handleConfirm = async () => {
    if (generatedDates.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Selection',
        text2: 'Please select at least one active day in the date range.',
      });
      return;
    }

    setSubmitting(true);
    try {
      const entries = generatedDates.map((dateStr) => ({
        scheduledDate: dateStr,
        minSessions,
        maxSessions,
      }));
      await onSubmit(entries);
      Toast.show({
        type: 'success',
        text1: 'Schedules Created',
        text2: `Successfully added ${entries.length} scheduled days.`,
      });
      onClose();
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Failed to Create Schedules',
        text2: err?.message || 'An unexpected error occurred.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => { }}>
          <View style={styles.header}>
            <Text style={styles.title}>Create Schedules</Text>
            <Pressable onPress={onClose} hitSlop={8} style={styles.closeBtn}>
              <Ionicons name="close" size={18} color={colors.textGrey} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.body}>
            <Text style={styles.label}>Date Range</Text>
            <View style={styles.datePickerRow}>
              <View style={styles.dateCol}>
                <Text style={styles.subLabel}>Start Date</Text>
                <Pressable
                  style={styles.dateButton}
                  onPress={() => setShowStartPicker(true)}
                >
                  <Ionicons name="calendar-outline" size={16} color={colors.primary} />
                  <Text style={styles.dateButtonText}>
                    {startDate.toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Text>
                </Pressable>
              </View>

              <View style={styles.dateCol}>
                <Text style={styles.subLabel}>End Date</Text>
                <Pressable
                  style={styles.dateButton}
                  onPress={() => setShowEndPicker(true)}
                >
                  <Ionicons name="calendar-outline" size={16} color={colors.primary} />
                  <Text style={styles.dateButtonText}>
                    {endDate.toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Text>
                </Pressable>
              </View>
            </View>

            {showStartPicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                onChange={onStartDateChange}
              />
            )}

            {showEndPicker && (
              <DateTimePicker
                value={endDate}
                mode="date"
                minimumDate={startDate}
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                onChange={onEndDateChange}
              />
            )}

            <Text style={styles.label}>Repeat On</Text>
            <View style={styles.weekdaysRow}>
              {WEEKDAYS.map((day) => {
                const selected = selectedDays.includes(day.value);
                return (
                  <Pressable
                    key={day.value}
                    style={[styles.dayChip, selected && styles.dayChipSelected]}
                    onPress={() => toggleDay(day.value)}
                  >
                    <Text
                      style={[styles.dayChipText, selected && styles.dayChipTextSelected]}
                    >
                      {day.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.label}>Sessions Target Per Day</Text>
            <View style={styles.counterRow}>
              <View style={styles.counterCol}>
                <Text style={styles.subLabel}>Min Sessions</Text>
                <View style={styles.counterControls}>
                  <Pressable
                    style={styles.counterBtn}
                    onPress={() => setMinSessions(Math.max(1, minSessions - 1))}
                  >
                    <Text style={styles.counterBtnText}>-</Text>
                  </Pressable>
                  <Text style={styles.counterVal}>{minSessions}</Text>
                  <Pressable
                    style={styles.counterBtn}
                    onPress={() => setMinSessions(minSessions + 1)}
                  >
                    <Text style={styles.counterBtnText}>+</Text>
                  </Pressable>
                </View>
              </View>

              <View style={styles.counterCol}>
                <Text style={styles.subLabel}>Max Sessions</Text>
                <View style={styles.counterControls}>
                  <Pressable
                    style={styles.counterBtn}
                    onPress={() => setMaxSessions(Math.max(minSessions, maxSessions - 1))}
                  >
                    <Text style={styles.counterBtnText}>-</Text>
                  </Pressable>
                  <Text style={styles.counterVal}>{maxSessions}</Text>
                  <Pressable
                    style={styles.counterBtn}
                    onPress={() => setMaxSessions(maxSessions + 1)}
                  >
                    <Text style={styles.counterBtnText}>+</Text>
                  </Pressable>
                </View>
              </View>
            </View>

            <View style={styles.summaryBox}>
              <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
              <Text style={styles.summaryText}>
                Will create <Text style={styles.bold}>{generatedDates.length} scheduled days</Text>{' '}
                from {startDate.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}{' '}
                to {endDate.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}.
              </Text>
            </View>

            <Pressable
              style={[
                styles.submitBtn,
                (generatedDates.length === 0 || submitting) && styles.disabledBtn,
              ]}
              disabled={generatedDates.length === 0 || submitting}
              onPress={handleConfirm}
            >
              {submitting ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.submitBtnText}>
                  Generate {generatedDates.length} Schedule Slot(s)
                </Text>
              )}
            </Pressable>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.lg,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.subheading,
    fontWeight: '700',
    color: colors.textDark,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.textGrey + '18',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { gap: spacing.md },
  label: {
    fontSize: typography.label,
    fontWeight: '700',
    color: colors.textDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subLabel: {
    fontSize: typography.small,
    color: colors.textGrey,
    marginBottom: 4,
  },
  datePickerRow: { flexDirection: 'row', gap: spacing.md },
  dateCol: { flex: 1 },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  dateButtonText: {
    fontSize: typography.small,
    fontWeight: '600',
    color: colors.textDark,
  },
  weekdaysRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm - 2,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  dayChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayChipText: {
    fontSize: typography.small - 1,
    fontWeight: '600',
    color: colors.textGrey,
  },
  dayChipTextSelected: { color: colors.white },
  counterRow: { flexDirection: 'row', gap: spacing.md },
  counterCol: { flex: 1 },
  counterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    justifyContent: 'space-between',
    padding: 4,
  },
  counterBtn: {
    width: 28,
    height: 28,
    backgroundColor: colors.primary + '15',
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  counterVal: {
    fontSize: typography.body,
    fontWeight: '700',
    color: colors.textDark,
  },
  summaryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.primary + '10',
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  summaryText: { flex: 1, fontSize: typography.small, color: colors.textDark },
  bold: { fontWeight: '700', color: colors.primary },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  disabledBtn: { opacity: 0.5 },
  submitBtnText: { color: colors.white, fontSize: typography.body, fontWeight: '700' },
});
