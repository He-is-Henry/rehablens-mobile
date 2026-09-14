import {
  colors,
  radius,
  spacing,
  typography,
} from "@/constants/theme";
import { useAuth } from "@/context/auth.context";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import ReminderForm from "./reminders/ReminderForm";

type ReminderFrequency = "once" | "daily" | "weekly";

type Reminder = {
  id: string;
  title: string;
  body: string;
  startDate: string;
  hour: number;
  minute: number;
  frequency: ReminderFrequency;
  occurrences: number;
  notificationIds: string[];
  createdAt: string;
};

const STORAGE_KEY = "reminders";

export default function Reminders() {
  const { requireStorage, user } = useAuth();

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadReminders = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const storage = requireStorage();
      const cached = await storage.get<Reminder[]>(
        STORAGE_KEY
      );

      setReminders(cached?.data ?? []);
    } catch (error) {
      console.error(
        "Failed to load reminders:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReminders();
  }, [user]);

  const saveReminders = async (next: Reminder[]) => {
    const storage = requireStorage();

    await storage.set(STORAGE_KEY, next);
    setReminders(next);
  };

  const createReminder = async ({
    title,
    body,
    date,
    hour,
    minute,
    frequency,
    occurrences,
  }: {
    title: string;
    body: string;
    date: Date;
    hour: number;
    minute: number;
    frequency: ReminderFrequency;
    occurrences: number;
  }) => {
    try {
      setSaving(true);

      const permission =
        await Notifications.getPermissionsAsync();

      let status = permission.status;

      if (status !== "granted") {
        const requested =
          await Notifications.requestPermissionsAsync();

        status = requested.status;
      }

      if (status !== "granted") {
        Alert.alert(
          "Notifications disabled",
          "Please allow notifications to create reminders."
        );
        return;
      }

      const count =
        frequency === "once" ? 1 : occurrences;

      const notificationIds: string[] = [];

      const reminderId = `${Date.now()}`;

      for (let i = 0; i < count; i++) {
        const notificationDate = new Date(date);

        notificationDate.setHours(
          hour,
          minute,
          0,
          0
        );

        if (frequency === "daily") {
          notificationDate.setDate(
            notificationDate.getDate() + i
          );
        }

        if (frequency === "weekly") {
          notificationDate.setDate(
            notificationDate.getDate() + i * 7
          );
        }

        if (
          notificationDate.getTime() <=
          Date.now()
        ) {
          continue;
        }

        const notificationId =
          await Notifications.scheduleNotificationAsync(
            {
              content: {
                title,
                body:
                  body ||
                  "You have a rehabilitation reminder.",
                data: {
                  type: "rehablens-reminder",
                  reminderId,
                },
              },

              trigger: {
                type: Notifications
                  .SchedulableTriggerInputTypes.DATE,
                date: notificationDate,
              },
            }
          );

        notificationIds.push(notificationId);
      }

      if (!notificationIds.length) {
        Alert.alert(
          "Couldn't schedule reminder",
          "The selected reminder time has already passed."
        );
        return;
      }

      const reminder: Reminder = {
        id: reminderId,
        title,
        body,
        startDate: date.toISOString(),
        hour,
        minute,
        frequency,
        occurrences: count,
        notificationIds,
        createdAt: new Date().toISOString(),
      };

      await saveReminders([
        ...reminders,
        reminder,
      ]);

      Alert.alert(
        "Reminder saved",
        `${notificationIds.length} reminder${notificationIds.length === 1 ? "" : "s"
        } scheduled.`
      );
    } catch (error) {
      console.error(
        "Failed to create reminder:",
        error
      );

      Alert.alert(
        "Couldn't save reminder",
        "Something went wrong while scheduling the reminder."
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteReminder = (
    reminder: Reminder
  ) => {
    Alert.alert(
      "Delete reminder?",
      `Remove "${reminder.title}" and its scheduled notifications?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              for (const notificationId of
                reminder.notificationIds) {
                await Notifications.cancelScheduledNotificationAsync(
                  notificationId
                );
              }

              await saveReminders(
                reminders.filter(
                  (item) =>
                    item.id !== reminder.id
                )
              );
            } catch (error) {
              console.error(
                "Failed to delete reminder:",
                error
              );

              Alert.alert(
                "Couldn't delete reminder",
                "Something went wrong while deleting the reminder."
              );
            }
          },
        },
      ]
    );
  };

  const formatTime = (
    hour: number,
    minute: number
  ) => {
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;

    return `${displayHour}:${String(
      minute
    ).padStart(2, "0")} ${period}`;
  };

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
          >
            <Text style={styles.back}>←</Text>
          </Pressable>

          <Text style={styles.headerTitle}>
            Reminders
          </Text>

          <View style={styles.headerSpacer} />
        </View>

        <ReminderForm
          disabled={saving}
          onSubmit={createReminder}
        />

        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>
            Your reminders
          </Text>

          {loading ? (
            <Text style={styles.emptyText}>
              Loading reminders...
            </Text>
          ) : reminders.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>
                No reminders yet
              </Text>

              <Text style={styles.emptyText}>
                Create your first reminder above.
              </Text>
            </View>
          ) : (
            reminders.map((reminder) => (
              <View
                key={reminder.id}
                style={styles.card}
              >
                <View style={styles.cardContent}>
                  <Text style={styles.time}>
                    {formatTime(
                      reminder.hour,
                      reminder.minute
                    )}
                  </Text>

                  <Text style={styles.reminderTitle}>
                    {reminder.title}
                  </Text>

                  {reminder.body ? (
                    <Text style={styles.body}>
                      {reminder.body}
                    </Text>
                  ) : null}

                  <Text style={styles.meta}>
                    {reminder.frequency === "once"
                      ? `Once · ${formatDate(
                        reminder.startDate
                      )}`
                      : reminder.frequency ===
                        "daily"
                        ? `Daily · ${reminder.occurrences} days`
                        : `Weekly · ${reminder.occurrences} weeks`}
                  </Text>
                </View>

                <Pressable
                  onPress={() =>
                    deleteReminder(reminder)
                  }
                >
                  <Text style={styles.delete}>
                    Delete
                  </Text>
                </Pressable>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xl,
  },

  back: {
    fontSize: 28,
    color: colors.textDark,
  },

  headerTitle: {
    fontSize: typography.subheading,
    fontWeight: "700",
    color: colors.textDark,
  },

  headerSpacer: {
    width: 28,
  },

  listSection: {
    marginTop: spacing.xl,
  },

  sectionTitle: {
    fontSize: typography.subheading,
    fontWeight: "700",
    color: colors.textDark,
    marginBottom: spacing.md,
  },

  emptyState: {
    padding: spacing.lg,
    alignItems: "center",
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },

  emptyTitle: {
    fontSize: typography.body,
    fontWeight: "700",
    color: colors.textDark,
    marginBottom: spacing.sm,
  },

  emptyText: {
    fontSize: typography.small,
    color: colors.textGrey,
    textAlign: "center",
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },

  cardContent: {
    flex: 1,
    marginRight: spacing.md,
  },

  time: {
    fontSize: typography.subheading,
    fontWeight: "700",
    color: colors.primary,
  },

  reminderTitle: {
    marginTop: spacing.xs,
    fontSize: typography.body,
    fontWeight: "600",
    color: colors.textDark,
  },

  body: {
    marginTop: spacing.xs,
    fontSize: typography.small,
    color: colors.textGrey,
  },

  meta: {
    marginTop: spacing.sm,
    fontSize: typography.label,
    color: colors.textGrey,
  },

  delete: {
    fontSize: typography.small,
    fontWeight: "600",
    color: colors.error,
  },
});

