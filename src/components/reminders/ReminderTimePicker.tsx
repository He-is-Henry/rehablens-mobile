import { colors, radius, spacing, typography } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type Props = {
  hour: number;
  minute: number;
  onChange: (hour: number, minute: number) => void;
  onClose: () => void;
};

export default function ReminderTimePicker({
  hour,
  minute,
  onChange,
  onClose,
}: Props) {
  const initialIsPM = hour >= 12;

  const [hourInput, setHourInput] = useState(
    String(hour === 0 ? 12 : hour > 12 ? hour - 12 : hour)
  );

  const [minuteInput, setMinuteInput] = useState(
    String(minute).padStart(2, "0")
  );

  const [period, setPeriod] = useState<"AM" | "PM">(
    initialIsPM ? "PM" : "AM"
  );

  const [error, setError] = useState("");

  const applyTime = () => {
    Keyboard.dismiss();

    const parsedHour = Number(hourInput);
    const parsedMinute = Number(minuteInput);

    if (
      !hourInput ||
      !minuteInput ||
      !Number.isInteger(parsedHour) ||
      !Number.isInteger(parsedMinute) ||
      parsedHour < 1 ||
      parsedHour > 12 ||
      parsedMinute < 0 ||
      parsedMinute > 59
    ) {
      setError("Enter a valid time.");
      return;
    }

    let finalHour = parsedHour;

    if (period === "AM") {
      finalHour = parsedHour === 12 ? 0 : parsedHour;
    } else {
      finalHour = parsedHour === 12 ? 12 : parsedHour + 12;
    }

    setError("");

    onChange(finalHour, parsedMinute);
    onClose();
  };

  const handleHourChange = (text: string) => {
    const value = text.replace(/\D/g, "").slice(0, 2);
    setHourInput(value);

    if (error) setError("");
  };

  const handleMinuteChange = (text: string) => {
    const value = text.replace(/\D/g, "").slice(0, 2);
    setMinuteInput(value);

    if (error) setError("");
  };

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={onClose} />

      <View style={styles.card}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>REMINDER TIME</Text>
            <Text style={styles.title}>Set reminder time</Text>
          </View>

          <Pressable onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={20} color={colors.textGrey} />
          </Pressable>
        </View>

        <View style={styles.divider} />

        <Text style={styles.label}>Time</Text>

        <View style={styles.timeRow}>
          <View style={styles.timeInputContainer}>
            <TextInput
              value={hourInput}
              onChangeText={handleHourChange}
              placeholder="09"
              placeholderTextColor="#AAB5B2"
              keyboardType="number-pad"
              maxLength={2}
              style={styles.timeInput}
              selectTextOnFocus
            />

            <Text style={styles.inputHint}>Hour</Text>
          </View>

          <Text style={styles.colon}>:</Text>

          <View style={styles.timeInputContainer}>
            <TextInput
              value={minuteInput}
              onChangeText={handleMinuteChange}
              placeholder="30"
              placeholderTextColor="#AAB5B2"
              keyboardType="number-pad"
              maxLength={2}
              style={styles.timeInput}
              selectTextOnFocus
            />

            <Text style={styles.inputHint}>Minute</Text>
          </View>

          <View style={styles.periodContainer}>
            {(["AM", "PM"] as const).map((item) => {
              const selected = period === item;

              return (
                <Pressable
                  key={item}
                  onPress={() => setPeriod(item)}
                  style={[
                    styles.periodButton,
                    selected && styles.selectedPeriod,
                  ]}
                >
                  <Text
                    style={[
                      styles.periodText,
                      selected && styles.selectedPeriodText,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Text style={styles.helperText}>Use 1–12 for hour and 00–59 for minute.</Text>

        {!!error && <Text style={styles.errorText}>{error}</Text>}

        <Pressable onPress={applyTime} style={styles.doneButton}>
          <Text style={styles.doneButtonText}>Set time</Text>
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

  label: {
    fontSize: typography.small,
    fontWeight: "700",
    color: colors.textGrey,
    marginBottom: spacing.sm,
  },

  timeRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  timeInputContainer: {
    flex: 1,
  },

  timeInput: {
    height: 58,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "700",
    color: colors.textDark,
    paddingHorizontal: spacing.sm,
  },

  inputHint: {
    marginTop: 5,
    textAlign: "center",
    fontSize: typography.label,
    color: colors.textGrey,
  },

  colon: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.textDark,
    marginHorizontal: 8,
    marginBottom: 18,
  },

  periodContainer: {
    marginLeft: spacing.sm,
    gap: 6,
  },

  periodButton: {
    width: 58,
    height: 27,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  selectedPeriod: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  periodText: {
    fontSize: typography.label,
    fontWeight: "700",
    color: colors.textDark,
  },

  selectedPeriodText: {
    color: colors.white,
  },

  helperText: {
    marginTop: spacing.md,
    fontSize: typography.small,
    color: colors.textGrey,
  },

  errorText: {
    marginTop: spacing.sm,
    fontSize: typography.small,
    color: colors.error,
    fontWeight: "600",
  },

  doneButton: {
    marginTop: spacing.lg,
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

