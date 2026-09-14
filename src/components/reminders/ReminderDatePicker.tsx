import { colors, radius, spacing, typography } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Props = {
  value: Date;
  onChange: (date: Date) => void;
  onClose: () => void;
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function ReminderDatePicker({
  value,
  onChange,
  onClose,
}: Props) {
  const today = new Date();

  const [visibleMonth, setVisibleMonth] = useState(
    new Date(value.getFullYear(), value.getMonth(), 1)
  );

  const days = useMemo(() => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      cells.push(day);
    }

    return cells;
  }, [visibleMonth]);

  const isToday = (day: number) =>
    day === today.getDate() &&
    visibleMonth.getMonth() === today.getMonth() &&
    visibleMonth.getFullYear() === today.getFullYear();

  const isSelected = (day: number) =>
    day === value.getDate() &&
    visibleMonth.getMonth() === value.getMonth() &&
    visibleMonth.getFullYear() === value.getFullYear();

  const isPast = (day: number) => {
    const date = new Date(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth(),
      day
    );

    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    return date < todayStart;
  };

  const changeMonth = (amount: number) => {
    const next = new Date(visibleMonth);
    next.setMonth(next.getMonth() + amount);

    const currentMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );

    if (next < currentMonth) return;

    setVisibleMonth(next);
  };

  const selectDate = (day: number) => {
    if (isPast(day)) return;

    const selected = new Date(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth(),
      day
    );

    selected.setHours(value.getHours(), value.getMinutes(), 0, 0);

    onChange(selected);
    onClose();
  };

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={onClose} />

      <View style={styles.card}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>REMINDER DATE</Text>
            <Text style={styles.title}>
              {value.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </Text>
          </View>

          <Pressable onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={20} color={colors.textGrey} />
          </Pressable>
        </View>

        <View style={styles.divider} />

        <View style={styles.monthHeader}>
          <Pressable
            onPress={() => changeMonth(-1)}
            style={styles.monthButton}
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color={colors.textDark}
            />
          </Pressable>

          <Text style={styles.monthTitle}>
            {MONTHS[visibleMonth.getMonth()]}{" "}
            {visibleMonth.getFullYear()}
          </Text>

          <Pressable
            onPress={() => changeMonth(1)}
            style={styles.monthButton}
          >
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textDark}
            />
          </Pressable>
        </View>

        <View style={styles.weekdays}>
          {WEEKDAYS.map((day) => (
            <Text key={day} style={styles.weekday}>
              {day}
            </Text>
          ))}
        </View>

        <View style={styles.calendar}>
          {days.map((day, index) => {
            if (day === null) {
              return <View key={`empty-${index}`} style={styles.dayCell} />;
            }

            const selected = isSelected(day);
            const todayDate = isToday(day);
            const past = isPast(day);

            return (
              <View key={day} style={styles.dayCell}>
                <Pressable
                  disabled={past}
                  onPress={() => selectDate(day)}
                  style={[
                    styles.dayButton,
                    selected && styles.selectedDay,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      past && styles.pastDay,
                      todayDate && !selected && styles.todayText,
                      selected && styles.selectedDayText,
                    ]}
                  >
                    {day}
                  </Text>

                  {todayDate && !selected && (
                    <View style={styles.todayDot} />
                  )}
                </Pressable>
              </View>
            );
          })}
        </View>

        <Pressable onPress={onClose} style={styles.doneButton}>
          <Text style={styles.doneButtonText}>Done</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },

  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
  },

  card: {
    width: "90%",
    maxWidth: 390,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  eyebrow: {
    fontSize: typography.label,
    fontWeight: "700",
    letterSpacing: 1,
    color: colors.textGrey,
    marginBottom: 4,
  },

  title: {
    fontSize: typography.subheading,
    fontWeight: "700",
    color: colors.textDark,
  },

  closeButton: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },

  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },

  monthTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.textDark,
  },

  monthButton: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },

  weekdays: {
    flexDirection: "row",
    marginBottom: spacing.sm,
  },

  weekday: {
    flex: 1,
    textAlign: "center",
    fontSize: typography.small,
    fontWeight: "600",
    color: colors.textGrey,
  },

  calendar: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  dayCell: {
    width: `${100 / 7}%`,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
  },

  dayButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },

  selectedDay: {
    backgroundColor: colors.primary,
  },

  dayText: {
    fontSize: typography.body,
    fontWeight: "500",
    color: colors.textDark,
  },

  selectedDayText: {
    color: colors.white,
    fontWeight: "700",
  },

  pastDay: {
    color: "#B8C1BF",
  },

  todayText: {
    color: colors.primary,
    fontWeight: "700",
  },

  todayDot: {
    position: "absolute",
    bottom: 3,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },

  doneButton: {
    marginTop: spacing.md,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  doneButtonText: {
    color: colors.white,
    fontSize: typography.body,
    fontWeight: "700",
  },
});

