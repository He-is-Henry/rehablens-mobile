import { colors, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/context/auth.context';
import { useRefresh } from '@/hooks/useRefresh';
import { getActivity } from '@/lib/audit';
import { renderAuditSentence } from '@/lib/audit-sentence';
import { useAuditQuery } from '@/queries/audit';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ActivityScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const currentUserId = user?._id;

  const {
    data: queryEntries,
    loading,
    refreshData,
  } = useAuditQuery.allActivity(30);

  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const { refreshing, onRefreshControl } = useRefresh(refreshData);

  useEffect(() => {
    if (queryEntries) {
      setEntries(queryEntries);
      setHasMore(queryEntries.length === 30);
    }
  }, [queryEntries]);

  const loadMore = async () => {
    if (loadingMore || !hasMore || entries.length === 0) return;
    setLoadingMore(true);
    try {
      const cursor = entries[entries.length - 1]._id;
      const data = await getActivity({ limit: 30, cursor });
      setEntries((prev) => [...prev, ...data]);
      setHasMore(data.length === 30);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Activity</Text>
        <View style={{ width: 22 }} />
      </View>

      {loading && entries.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      item.outcome === 'failure' ? colors.error : colors.success,
                  },
                ]}
              />
              <View style={styles.rowContent}>
                <Text style={styles.sentence}>
                  {renderAuditSentence(item, currentUserId)}
                </Text>
                <Text style={styles.time}>
                  {new Date(item.createdAt).toLocaleString()}
                  {item.location ? ` · ${item.location}` : ''}
                  {item.deviceInfo ? ` · ${item.deviceInfo}` : ''}
                </Text>
              </View>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefreshControl}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>No activity yet</Text>
            </View>
          }
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator
                color={colors.primary}
                style={{ marginVertical: spacing.md }}
              />
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primaryDark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  headerTitle: {
    color: colors.white,
    fontSize: typography.subheading,
    fontWeight: '700',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing.xl,
  },
  list: { padding: spacing.lg },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  rowContent: { flex: 1, gap: 2 },
  sentence: {
    fontSize: typography.body,
    color: colors.textDark,
    lineHeight: 20,
  },
  time: {
    fontSize: typography.label,
    color: colors.textGrey,
  },
  separator: { height: spacing.md },
  emptyText: { fontSize: typography.small, color: colors.textGrey },
});