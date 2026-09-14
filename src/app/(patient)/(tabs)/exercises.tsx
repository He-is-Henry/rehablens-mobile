import AssignmentCard from "@/components/AssignmentCard";
import { colors, radius, spacing, typography } from "@/constants/theme";
import { useRefresh } from "@/hooks/useRefresh";
import { usePatientQuery } from "@/queries/patient";
import { router } from "expo-router";
import { useMemo, useState } from "react";
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

export default function Exercise() {
  const insets = useSafeAreaInsets();

  const { data: assignments, refreshData, loading } = usePatientQuery.assignments()


  const [selectedHospitalId, setSelectedHospitalId] = useState<string>("all");


  const { refreshing, onRefreshControl } = useRefresh(refreshData);


  const hospitals = useMemo(() => {
    const map = new Map<string, string>();
    assignments?.forEach((item) => {
      if (item.hospitalId?._id && item.hospitalId?.name) {
        map.set(item.hospitalId._id, item.hospitalId.name);
      }
    });
    return Array.from(map.entries()).map(([_id, name]) => ({ _id, name }));
  }, [assignments]);

  // Filter assignments based on selected pill
  const filteredAssignments = useMemo(() => {
    if (selectedHospitalId === "all") return assignments;
    return assignments?.filter(
      (item) => item.hospitalId?._id === selectedHospitalId
    );
  }, [assignments, selectedHospitalId]);

  if (loading) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Title Header */}
      <View style={styles.headerTitleContainer}>
        <Text style={styles.headerTitle}>My Exercises</Text>
      </View>

      {/* Hospital Filter Pills Header */}
      {hospitals.length > 0 && (
        <View style={styles.filterWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pillsContainer}
          >
            {/* "All" Pill */}
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
                All ({assignments?.length})
              </Text>
            </Pressable>

            {/* Individual Hospital Pills */}
            {hospitals.map((hospital) => {
              const isSelected = selectedHospitalId === hospital._id;
              const count = assignments?.filter(
                (a) => a.hospitalId?._id === hospital._id
              ).length;

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
        </View>
      )}

      {/* Assignment List */}
      <FlatList
        data={filteredAssignments}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefreshControl}
          />
        }
        renderItem={({ item }) => <Pressable onPress={() => router.push(`/(patient)/assignment/${item._id}`)} style={({ pressed }) => pressed && { opacity: 0.85 }}>
          <AssignmentCard assignment={item} /></Pressable>}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {selectedHospitalId === "all"
                ? "No assigned exercises found."
                : "No exercises found for this hospital."}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.subheading ?? 22,
    fontWeight: "700",
    color: colors.textDark,
  },
  filterWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  pillsContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
    alignItems: "center",
  },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    backgroundColor: colors.border + "40",
  },
  pillActive: {
    backgroundColor: colors.primary,
  },
  pillText: {
    fontSize: typography.small,
    fontWeight: "600",
    color: colors.textGrey,
  },
  pillTextActive: {
    color: colors.white,
  },
  list: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  empty: {
    alignItems: "center",
    paddingTop: spacing.xxl,
  },
  emptyText: {
    fontSize: typography.body,
    color: colors.textGrey,
  },
});