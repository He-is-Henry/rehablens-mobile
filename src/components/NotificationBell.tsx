import { colors, radius } from '@/constants/theme';
import { useAuth } from '@/context/auth.context';
import { markSeen } from '@/lib/audit';
import { renderAuditSentence } from '@/lib/audit-sentence';
import { useAuditQuery } from '@/queries/audit';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function NotificationBell() {
  const router = useRouter();
  const { user } = useAuth();

  const { data: countData, setData: setCountData, refreshData: refreshCount } = useAuditQuery.unseenCount();

  const {
    data: entriesData,
    loading,
    refreshData: refreshActivity
  } = useAuditQuery.unseenActivity();

  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const count = countData?.count ?? 0;
  const entries = entriesData ?? [];
  const currentUserId = user?._id;

  const openBell = () => {
    setOpen(true);
    setReadIds(new Set());
    Promise.all([refreshActivity(), refreshCount()]);
  };

  const markOneSeen = async (id: string) => {
    if (readIds.has(id)) return;

    setReadIds((prev) => new Set(prev).add(id));
    setCountData((prev) => ({
      count: Math.max((prev?.count ?? 1) - 1, 0),
    }));

    await markSeen([id]).catch(() => {
      setReadIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setCountData((prev) => ({
        count: (prev?.count ?? 0) + 1,
      }));
    });
  };

  const markAllSeen = async () => {
    const unreadEntries = entries.filter((e) => !readIds.has(e._id));
    if (unreadEntries.length === 0) return;

    const unreadIds = unreadEntries.map((e) => e._id);

    setReadIds((prev) => new Set([...prev, ...unreadIds]));
    setCountData({ count: 0 });

    await markSeen(unreadIds).catch(() => { });
  };

  const handleNavigateToActivity = () => {
    setOpen(false);
    router.push('/activity');
  };

  return (
    <>
      <Pressable onPress={openBell} hitSlop={8} style={styles.bellWrap}>
        <Ionicons name="notifications-outline" size={22} color={colors.white} />
        {count > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{count > 9 ? '9+' : count}</Text>
          </View>
        )}
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => { }}>
            <View style={styles.header}>
              <Text style={styles.title}>Notifications</Text>
              {entries.some((e) => !readIds.has(e._id)) && (
                <Pressable onPress={markAllSeen} hitSlop={6}>
                  <Text style={styles.markAllText}>Mark all as read</Text>
                </Pressable>
              )}
            </View>

            {loading && entries.length === 0 ? (
              <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />
            ) : (
              <>
                <FlatList
                  data={entries}
                  keyExtractor={(item) => item._id}
                  style={{ maxHeight: 320 }}
                  renderItem={({ item }) => {
                    const isRead = readIds.has(item._id);
                    const isFailure = item.outcome === 'failure';

                    return (
                      <Pressable
                        onPress={() => markOneSeen(item._id)}
                        style={[styles.row, !isRead && styles.unreadRow]}
                      >
                        <View style={styles.rowTop}>
                          <View
                            style={[
                              styles.statusDot,
                              { backgroundColor: isFailure ? colors.error : colors.success },
                            ]}
                          />
                          <Text style={[styles.sentence, isRead && styles.readSentence]}>
                            {renderAuditSentence(item, currentUserId)}
                          </Text>
                        </View>
                        {(item.location || item.deviceInfo) && (
                          <Text style={styles.meta}>
                            {[item.location, item.deviceInfo].filter(Boolean).join(' · ')}
                          </Text>
                        )}
                      </Pressable>
                    );
                  }}
                  ItemSeparatorComponent={() => <View style={styles.separator} />}
                  ListEmptyComponent={
                    <Text style={styles.emptyText}>Nothing new</Text>
                  }
                />

                <View style={styles.footer}>
                  <Pressable onPress={handleNavigateToActivity} style={styles.fullActivityBtn}>
                    <Text style={styles.fullActivityText}>See full activity</Text>
                    <Ionicons name="chevron-forward" size={14} color={colors.primary} />
                  </Pressable>
                </View>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  bellWrap: { padding: 4 },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 90,
    paddingRight: 16,
  },
  sheet: {
    width: 320,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textDark,
  },
  markAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },

  row: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: radius.sm ?? 6,
  },
  unreadRow: {
    backgroundColor: 'rgba(0, 102, 255, 0.05)', // Subtle highlight for unread items
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
  },
  sentence: {
    flex: 1,
    fontSize: 13,
    color: colors.textDark,
    lineHeight: 18,
    fontWeight: '600',
  },
  readSentence: {
    color: colors.textGrey,
    fontWeight: '400',
  },
  meta: {
    fontSize: 11,
    color: colors.textGrey,
    marginTop: 2,
    paddingLeft: 14,
  },
  errorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.error,
    marginTop: 6,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textGrey,
    textAlign: 'center',
    paddingVertical: 20,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
    marginTop: 4,
    alignItems: 'center',
  },
  fullActivityBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  fullActivityText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
});