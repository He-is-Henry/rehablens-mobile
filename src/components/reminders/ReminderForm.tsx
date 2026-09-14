import {
  colors,
  radius,
  spacing,
  typography,
} from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import ReminderDatePicker from "./ReminderDatePicker";
import ReminderTimePicker from "./ReminderTimePicker";

type ReminderFrequency = "once" | "daily" | "weekly";

type Props = {
  disabled?: boolean;
  onSubmit: (data: {
    title: string;
    body: string;
    date: Date;
    hour: number;
    minute: number;
    frequency: ReminderFrequency;
    occurrences: number;
  }) => void;
};

export default function ReminderForm({
  disabled = false,
  onSubmit,
}: Props) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const [date, setDate] = useState(new Date());

  const [hour, setHour] = useState(
    new Date().getHours()
  );

  const [minute, setMinute] = useState(
    new Date().getMinutes()
  );

  const [frequency, setFrequency] =
    useState<ReminderFrequency>("once");

  const [occurrences, setOccurrences] = useState(1);

  const [showDatePicker, setShowDatePicker] =
    useState(false);

  const [showTimePicker, setShowTimePicker] =
    useState(false);

  const submit = () => {
    if (!title.trim() || disabled) {
      return;
    }

    onSubmit({
      title: title.trim(),
      body: body.trim(),
      date,
      hour,
      minute,
      frequency,
      occurrences,
    });

    setTitle("");
    setBody("");
  };

  const formatDate = (value: Date) =>
    value.toLocaleDateString(undefined, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const formatTime = () => {
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;

    return `${displayHour}:${String(minute).padStart(
      2,
      "0"
    )} ${period}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>
        New reminder
      </Text>

      <Text style={styles.label}>Title</Text>

      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="e.g. Morning exercise"
        placeholderTextColor={colors.textGrey}
        style={styles.input}
      />

      <Text style={styles.label}>Message</Text>

      <TextInput
        value={body}
        onChangeText={setBody}
        placeholder="e.g. Time for your exercise"
        placeholderTextColor={colors.textGrey}
        style={[styles.input, styles.messageInput]}
        multiline
      />

      <Text style={styles.label}>Date</Text>

      <Pressable
        onPress={() => setShowDatePicker(true)}
        style={styles.selector}
      >
        <Text style={styles.selectorText}>
          {formatDate(date)}
        </Text>

        <Ionicons
          name="calendar-outline"
          size={20}
          color={colors.textGrey}
        />
      </Pressable>

      {showDatePicker && (
        <ReminderDatePicker
          value={date}
          onChange={setDate}
          onClose={() => setShowDatePicker(false)}
        />
      )}

      <Text style={styles.label}>Time</Text>

      <Pressable
        onPress={() => setShowTimePicker(true)}
        style={styles.selector}
      >
        <Text style={styles.selectorText}>
          {formatTime()}
        </Text>

        <Ionicons
          name="time-outline"
          size={20}
          color={colors.textGrey}
        />
      </Pressable>

      {showTimePicker && (
        <ReminderTimePicker
          hour={hour}
          minute={minute}
          onChange={(nextHour, nextMinute) => {
            setHour(nextHour);
            setMinute(nextMinute);
          }}
          onClose={() => setShowTimePicker(false)}
        />
      )}

      <Text style={styles.label}>
        Frequency
      </Text>

      <View style={styles.frequencyRow}>
        {[
          { label: "Once", value: "once" },
          { label: "Daily", value: "daily" },
          { label: "Weekly", value: "weekly" },
        ].map((item) => {
          const selected =
            frequency === item.value;

          return (
            <Pressable
              key={item.value}
              onPress={() =>
                setFrequency(
                  item.value as ReminderFrequency
                )
              }
              style={[
                styles.pill,
                selected && styles.pillSelected,
              ]}
            >
              <Text
                style={[
                  styles.pillText,
                  selected &&
                  styles.pillTextSelected,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {frequency !== "once" && (
        <>
          <Text style={styles.label}>
            Number of{" "}
            {frequency === "daily"
              ? "days"
              : "weeks"}
          </Text>

          <View style={styles.counter}>
            <Pressable
              disabled={occurrences <= 1}
              onPress={() =>
                setOccurrences((value) =>
                  Math.max(1, value - 1)
                )
              }
              style={styles.counterButton}
            >
              <Text style={styles.counterText}>
                −
              </Text>
            </Pressable>

            <Text style={styles.counterValue}>
              {occurrences}
            </Text>

            <Pressable
              disabled={occurrences >= 365}
              onPress={() =>
                setOccurrences((value) =>
                  Math.min(365, value + 1)
                )
              }
              style={styles.counterButton}
            >
              <Text style={styles.counterText}>
                +
              </Text>
            </Pressable>
          </View>
        </>
      )}

      <Pressable
        disabled={disabled || !title.trim()}
        onPress={submit}
        style={[
          styles.saveButton,
          (disabled || !title.trim()) &&
          styles.disabled,
        ]}
      >
        <Text style={styles.saveText}>
          Save reminder
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },

  sectionTitle: {
    fontSize: typography.subheading,
    fontWeight: "700",
    color: colors.textDark,
    marginBottom: spacing.lg,
  },

  label: {
    fontSize: typography.label,
    fontWeight: "600",
    color: colors.textGrey,
    marginBottom: spacing.xs,
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    color: colors.textDark,
    backgroundColor: colors.background,
    fontSize: typography.body,
    marginBottom: spacing.md,
  },

  messageInput: {
    height: 80,
    paddingTop: spacing.md,
    textAlignVertical: "top",
  },

  selector: {
    minHeight: 48,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },

  selectorText: {
    fontSize: typography.body,
    color: colors.textDark,
  },

  frequencyRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },

  pill: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },

  pillSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  pillText: {
    fontSize: typography.small,
    fontWeight: "600",
    color: colors.textGrey,
  },

  pillTextSelected: {
    color: colors.white,
  },

  counter: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
    overflow: "hidden",
  },

  counterButton: {
    width: 52,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },

  counterText: {
    fontSize: 24,
    color: colors.primary,
  },

  counterValue: {
    fontSize: typography.body,
    fontWeight: "700",
    color: colors.textDark,
  },

  saveButton: {
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  saveText: {
    color: colors.white,
    fontSize: typography.body,
    fontWeight: "700",
  },

  disabled: {
    opacity: 0.45,
  },
});


