import ScheduleCard from "@/components/ScheduleCard";
import { colors, radius, spacing, typography } from "@/constants/theme";
import { useRefresh } from "@/hooks/useRefresh";
import { usePatientQuery } from "@/queries/patient";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type StatusFilter = "all" | "pending" | "completed";
const PAGE_LIMIT = 20;

export default function SchedulesScreen() {
  const insets = useSafeAreaInsets();

  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [schedulesList, setSchedulesList] = useState<Schedule[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const { data: batch, loading, refreshData } = usePatientQuery.schedules({
    limit: PAGE_LIMIT,
    cursor,
  });

  const [selectedHospitalId, setSelectedHospitalId] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>("all");

  const { refreshing, onRefreshControl } = useRefresh(async () => {
    setCursor(undefined);
    setHasMore(true);
    await refreshData();
  });

  useEffect(() => {
    if (batch) {
      if (!cursor) {
        setSchedulesList(batch);
      } else {
        setSchedulesList((prev) => {
          const existingIds = new Set(prev.map((item) => item._id));
          const newItems = batch.filter((item) => !existingIds.has(item._id));
          return [...prev, ...newItems];
        });
      }

      if (batch.length < PAGE_LIMIT) {
        setHasMore(false);
      }
      setLoadingMore(false);
    }
  }, [batch]);

  const loadMore = () => {
    if (!hasMore || loadingMore || loading || schedulesList.length === 0) return;
    const lastItem = schedulesList[schedulesList.length - 1];
    if (lastItem?._id) {
      setLoadingMore(true);
      setCursor(lastItem._id);
    }
  };

  const hospitals = useMemo(() => {
    const map = new Map<string, string>();
    schedulesList?.forEach((schedule) => {
      const assignment =
        typeof schedule.assignmentId === "object" ? schedule.assignmentId : null;
      const hospital =
        typeof assignment?.hospitalId === "object" ? assignment.hospitalId : null;

      if (hospital?._id && hospital?.name) {
        map.set(hospital._id, hospital.name);
      }
    });
    return Array.from(map.entries()).map(([_id, name]) => ({ _id, name }));
  }, [schedulesList]);

  const filteredSchedules = useMemo(() => {
    return schedulesList.filter((schedule) => {
      const assignment =
        typeof schedule.assignmentId === "object" ? schedule.assignmentId : null;
      const hospital =
        typeof assignment?.hospitalId === "object" ? assignment.hospitalId : null;

      const matchesHospital =
        selectedHospitalId === "all" || hospital?._id === selectedHospitalId;

      const isCompleted = (schedule.completedCount ?? 0) >= schedule.minSessions;

      const matchesStatus =
        selectedStatus === "all" ||
        (selectedStatus === "completed" && isCompleted) ||
        (selectedStatus === "pending" && !isCompleted);

      return matchesHospital && matchesStatus;
    });
  }, [schedulesList, selectedHospitalId, selectedStatus]);

  if (loading && !cursor && !refreshing) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.headerTitleContainer}>
        <Text style={styles.headerTitle}>My Schedules</Text>
      </View>

      <View style={styles.filterWrapper}>
        {hospitals.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pillsContainer}
          >
            <Pressable
              style={[
                styles.pill,
                selectedHospitalId === "all" && styles.pillActive,
              ]}
              onPress={() => setSelectedHospitalId("all")}
            >
              <Text
                style={[
                  styles.pillText,
                  selectedHospitalId === "all" && styles.pillTextActive,
                ]}
              >
                All ({schedulesList.length})
              </Text>
            </Pressable>

            {hospitals.map((hospital) => {
              const isSelected = selectedHospitalId === hospital._id;
              const count = schedulesList.filter((s) => {
                const assignment =
                  typeof s.assignmentId === "object" ? s.assignmentId : null;
                const h =
                  typeof assignment?.hospitalId === "object"
                    ? assignment.hospitalId
                    : null;
                return h?._id === hospital._id;
              }).length;

              return (
                <Pressable
                  key={hospital._id}
                  style={[styles.pill, isSelected && styles.pillActive]}
                  onPress={() => setSelectedHospitalId(hospital._id)}
                >
                  <Text
                    style={[
                      styles.pillText,
                      isSelected && styles.pillTextActive,
                    ]}
                  >
                    {hospital.name} ({count})
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        <View style={styles.statusSegment}>
          {(["all", "pending", "completed"] as StatusFilter[]).map((st) => (
            <Pressable
              key={st}
              style={[
                styles.segmentTab,
                selectedStatus === st && styles.segmentTabActive,
              ]}
              onPress={() => setSelectedStatus(st)}
            >
              <Text
                style={[
                  styles.segmentText,
                  selectedStatus === st && styles.segmentTextActive,
                ]}
              >
                {st.charAt(0).toUpperCase() + st.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <FlatList
        data={filteredSchedules}
        keyExtractor={(item) => item._id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + spacing.xxl * 2 },
        ]}
        onEndReached={loadMore}
        onEndReachedThreshold={1.2}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefreshControl}
            tintColor={colors.primary}
          />
        }
        renderItem={({ item }) => (
          <ScheduleCard
            schedule={item}
            onPress={() => {
              router.push({
                pathname: "/(patient)/exercise/[scheduleId]",
                params: { scheduleId: item._id },
              });
            }}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No scheduled sessions found.</Text>
          </View>
        }
      />

      {loadingMore && (
        <View style={[styles.floatingLoader, { bottom: insets.bottom + spacing.md }]}>
          <ActivityIndicator size="small" color={colors.white} />
          <Text style={styles.floatingLoaderText}>Loading more schedules...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerTitleContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.subheading,
    fontWeight: "700",
    color: colors.textDark,
  },
  filterWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
    gap: spacing.xs,
    paddingBottom: spacing.xs,
  },
  pillsContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    gap: spacing.xs,
    alignItems: "center",
  },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    backgroundColor: colors.border + "40",
  },
  pillActive: { backgroundColor: colors.primary },
  pillText: {
    fontSize: typography.small,
    fontWeight: "600",
    color: colors.textGrey,
  },
  pillTextActive: { color: colors.white },
  statusSegment: {
    flexDirection: "row",
    marginHorizontal: spacing.md,
    backgroundColor: colors.border + "30",
    borderRadius: radius.md,
    padding: 3,
  },
  segmentTab: {
    flex: 1,
    paddingVertical: spacing.xs,
    alignItems: "center",
    borderRadius: radius.sm,
  },
  segmentTabActive: { backgroundColor: colors.white },
  segmentText: {
    fontSize: typography.small,
    fontWeight: "600",
    color: colors.textGrey,
  },
  segmentTextActive: { color: colors.primary },
  list: { padding: spacing.md, gap: spacing.sm },
  empty: { alignItems: "center", paddingTop: spacing.xxl },
  emptyText: { fontSize: typography.body, color: colors.textGrey },
  floatingLoader: {
    position: "absolute",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.textDark,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 4,
    borderRadius: radius.full,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  floatingLoaderText: {
    fontSize: typography.small,
    fontWeight: "600",
    color: colors.white,
  },
});