import { colors, spacing } from "@/constants/theme"
import { useRefresh } from "@/hooks/useRefresh"
import { useState } from "react"
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from "react-native"
import EmptyState from "./EmptyState"
import StaffCard from "./StaffCard"
import StaffDetailModal from "./StaffDetailsModal"

type Props = {
  staff: User[],
  loadData(): void
}

export default function StaffList({ staff, loadData }: Props) {
  const [selectedId, setSelectedId] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const { refreshing, onRefreshControl } = useRefresh(loadData);

  return (
    <View style={styles.container}>
      {
        showDetailsModal && <StaffDetailModal staffId={selectedId} close={() => setShowDetailsModal(false)} onUpdated={loadData} />
      }

      <FlatList
        data={staff}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefreshControl} tintColor={colors.primary} />
        }

        ListEmptyComponent={<EmptyState label="No staff yet" sub="Add your first staff member" />}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              setSelectedId(item._id);
              setShowDetailsModal(true);
            }}
            style={({ pressed }) => pressed && { opacity: 0.8 }}
          ><StaffCard item={item} /></Pressable>
        )}
      />
    </View >
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  list: {
    padding: spacing.md,
    gap: spacing.sm,
    flex: 1
  },

})