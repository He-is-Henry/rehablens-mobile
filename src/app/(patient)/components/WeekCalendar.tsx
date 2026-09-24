import { colors, radius, spacing, typography } from '@/constants/theme';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

type Props = {
  selectedDate: string; // ISO date format YYYY-MM-DD
  onSelectDate: (dateStr: string) => void;
  markedDates?: Record<string, { completed?: boolean; hasSchedule?: boolean }>;
};

export function WeekCalendarStrip({ selectedDate, onSelectDate, markedDates }: Props) {
  const days = useMemo(() => {
    const result = [];
    const today = new Date();

    for (let i = -3; i <= 3; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const dayName = d.toLocaleDateString(undefined, { weekday: 'short' });
      const dayNum = d.getDate();

      result.push({ dateStr, dayName, dayNum, isToday: i === 0 });
    }
    return result;
  }, []);

  return (
    <View style={styles.calendarContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {days.map((item) => {
          const isSelected = item.dateStr === selectedDate;
          const status = markedDates?.[item.dateStr];

          return (
            <Pressable
              key={item.dateStr}
              style={[
                styles.dayCard,
                isSelected && styles.dayCardSelected,
                item.isToday && !isSelected && styles.dayCardToday,
              ]}
              onPress={() => onSelectDate(item.dateStr)}
            >
              <Text style={[styles.dayName, isSelected && styles.textSelected]}>
                {item.dayName}
              </Text>
              <Text style={[styles.dayNum, isSelected && styles.textSelected]}>
                {item.dayNum}
              </Text>

              {/* Status Indicator Dot */}
              <View style={styles.dotContainer}>
                {status?.completed ? (
                  <View style={[styles.dot, { backgroundColor: colors.success }]} />
                ) : status?.hasSchedule ? (
                  <View style={[styles.dot, { backgroundColor: colors.primary }]} />
                ) : (
                  <View style={styles.dotEmpty} />
                )}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  calendarContainer: {
    paddingVertical: spacing.xs,
    marginBottom: spacing.md,
  },
  scroll: {
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  dayCard: {
    width: 48,
    height: 68,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  dayCardToday: {
    borderColor: colors.primary,
  },
  dayCardSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayName: {
    fontSize: typography.small - 2,
    color: colors.textGrey,
    fontWeight: '600',
  },
  dayNum: {
    fontSize: typography.body,
    fontWeight: '700',
    color: colors.textDark,
    marginTop: 2,
  },
  textSelected: {
    color: colors.white,
  },
  dotContainer: {
    marginTop: 4,
    height: 6,
    justifyContent: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotEmpty: {
    width: 6,
    height: 6,
  },
});