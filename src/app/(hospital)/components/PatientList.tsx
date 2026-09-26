import { spacing } from "@/constants/theme";
import { useRefresh } from "@/hooks/useRefresh";
import { useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from "react-native";
import CreateAssignmentModal from "./CreateAssignmentModal";
import EmptyState from "./EmptyState";
import PatientCard from "./PatientCard";
import PatientDetailModal from "./PatientDetailModal";

type Props = {
  patients: Link[];
  loadData(): void;
  setPatient: (newData: any) => void;
};

export default function PatientList({ patients, loadData, setPatient }: Props) {
  const [selectedLink, setSelectedLink] = useState<Link | null>(null);
  const [assignTarget, setAssignTarget] = useState<Link | null>(null);
  const { refreshing, onRefreshControl } = useRefresh(loadData);

  const updatePatient = (updatedPatient: Link) => {
    setPatient((prev: Link[]) => [
      ...(prev?.filter((p) => p._id !== updatedPatient._id) ?? []),
      updatedPatient,
    ]);

    setSelectedLink(updatedPatient);
  };

  return (
    <View style={styles.container}>
      {selectedLink && (
        <PatientDetailModal
          link={selectedLink}
          close={() => setSelectedLink(null)}
          onUpdated={updatePatient}
          onAssignExercise={() => {
            setAssignTarget(selectedLink);
            setSelectedLink(null);
          }}
        />
      )}

      {assignTarget && (
        <CreateAssignmentModal
          patientId={assignTarget.patientId._id}
          patientName={assignTarget.patientId.name}
          close={() => setAssignTarget(null)}
          onCreated={loadData}
        />
      )}

      <FlatList
        data={patients}
        keyExtractor={(item) => item._id}
        style={styles.flatList}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefreshControl} />
        }
        ListEmptyComponent={
          <EmptyState label="No patients linked" sub="Link your first patient" />
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => setSelectedLink(item)}
            style={({ pressed }) => pressed && { opacity: 0.8 }}
          >
            <PatientCard item={item} />
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flatList: {
    flex: 1,
  },
  listContent: {
    padding: spacing.md,
    gap: spacing.sm,
  },
});
