import { colors, radius } from '@/constants/theme';
import { getActivity, getUnseenCount, markSeen } from '@/lib/audit';
import { renderAuditSentence } from '@/lib/audit-sentence';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
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
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getUnseenCount().then((res) => setCount(res.count)).catch(() => { });
  }, []);

  const openBell = async () => {
    setOpen(true);
    setLoading(true);
    try {
      const data = await getActivity({ unseenOnly: true, limit: 20 });
      setEntries(data);
      if (data.length > 0) {
        await markSeen(data.map((d) => d._id));
        setCount(0);
      }
    } finally {
      setLoading(false);
    }
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
            <Text style={styles.title}>Notifications</Text>

            {loading ? (
              <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />
            ) : (
              <FlatList
                data={entries}
                keyExtractor={(item) => item._id}
                style={{ maxHeight: 360 }}
                renderItem={({ item }) => (
                  <View style={styles.row}>
                    <Text style={styles.sentence}>{renderAuditSentence(item)}</Text>
                  </View>
                )}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>Nothing new</Text>
                }
              />
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
  badgeText: { color: colors.white, fontSize: 10, fontWeight: '700' },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 90,
    paddingRight: 16,
  },
  sheet: {
    width: 300,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: 16,
    gap: 8,
  },
  title: { fontSize: 16, fontWeight: '700', color: colors.textDark },
  row: { paddingVertical: 8 },
  sentence: { fontSize: 13, color: colors.textDark, lineHeight: 18 },
  separator: { height: 1, backgroundColor: colors.border },
  emptyText: { fontSize: 13, color: colors.textGrey, textAlign: 'center', paddingVertical: 20 },
});