import AssignmentCard from '@/components/AssignmentCard';
import { colors, spacing, typography } from '@/constants/theme';
import { getPatientAssignments } from '@/lib/patient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

type Props = {
  hospitalId: string;
};

export default function AssignmentList({ hospitalId }: Props) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPatientAssignments(hospitalId, 'active',)
      .then(setAssignments)
      .finally(() => setLoading(false));
  }, [hospitalId]);

  if (loading) {
    return <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.lg }} />;
  }

  if (assignments.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No exercises assigned yet</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={assignments}
      keyExtractor={(item) => item._id}
      contentContainerStyle={styles.list}
      scrollEnabled={false}
      renderItem={({ item }) => (
        <AssignmentCard
          assignment={item}
          onPress={() =>
            item.status === 'active'
              ? router.push(`/(patient)/exercise/${item._id}`)
              : router.push(`/(patient)/assignment/${item._id}`)
          }
        />
      )}
      ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingTop: spacing.xs,
  },
  empty: {
    paddingVertical: spacing.lg,
    alignItems: 'center'
  },
  emptyText: {
    fontSize: typography.small, color: colors.textGrey
  },
});