import { spacing } from "@/constants/theme"
import { useRefresh } from "@/hooks/useRefresh"
import { useState } from "react"
import { FlatList, Pressable, RefreshControl, StyleSheet } from "react-native"
import CreateAssignmentModal from "./CreateAssignmentModal"
import EmptyState from "./EmptyState"
import PatientCard from "./PatientCard"
import PatientDetailModal from "./PatientDetailModal"

type Props = {
  patients: Link[]
  loadData(): void
}

export default function PatientList({ patients, loadData }: Props) {
  const [selectedLink, setSelectedLink] = useState<Link | null>(null);
  const [assignTarget, setAssignTarget] = useState<Link | null>(null);
  const { refreshing, onRefreshControl } = useRefresh(loadData);

  return <>
    {selectedLink && (
      <PatientDetailModal
        link={selectedLink}
        close={() => setSelectedLink(null)}
        onUpdated={loadData}
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
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefreshControl} />}
      ListEmptyComponent={<EmptyState label="No patients linked" sub="Link your first patient" />}
      renderItem={({ item }) => (
        <Pressable
          onPress={() => setSelectedLink(item)}
          style={({ pressed }) => pressed && { opacity: 0.8 }}
        >
          <PatientCard item={item} />
        </Pressable>
      )}
    />
  </>
}

const styles = StyleSheet.create({
  list: {
    padding: spacing.md,
    gap: spacing.sm,
    flex: 1
  }
})