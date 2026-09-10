import { colors, radius, spacing, typography } from '@/constants/theme';
import { linkPatient, searchPatients } from '@/lib/hospital';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';

type Props = {
  close(): void;
  onLinked(): void;
}

export default function LinkPatientModal({ close, onLinked }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [selected, setSelected] = useState<User | null>(null);
  const [searching, setSearching] = useState(false);
  const [linking, setLinking] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback((text: string) => {
    setQuery(text);
    setSelected(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (text.trim().length < 3) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await searchPatients(text);
        setResults(data ?? []);
      } finally {
        setSearching(false);
      }
    }, 300);
  }, []);

  const handleLink = async () => {
    if (!selected) return;
    setLinking(true);
    try {
      await linkPatient(selected._id);
      Toast.show({ type: 'success', text1: 'Patient linked' });
      onLinked();
      close();
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Failed to link', text2: e.message });
    } finally {
      setLinking(false);
    }
  };

  return (
    <Modal transparent statusBarTranslucent animationType="fade" onRequestClose={close}>
      <Pressable style={styles.overlay} onPress={close}>
        <Pressable style={styles.card} onPress={() => { }}>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Link patient</Text>
            <Pressable onPress={close} hitSlop={8} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>×</Text>
            </Pressable>
          </View>

          {/* Search */}
          <View style={styles.searchRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={query}
              onChangeText={handleSearch}
              placeholder="Search by name or ID (min 3)"
              placeholderTextColor={colors.textGrey}
              autoFocus
            />
            {searching && (
              <ActivityIndicator
                size="small"
                color={colors.primary}
                style={{ marginLeft: spacing.xs }}
              />
            )}
          </View>

          {/* Selected confirmation */}
          {selected ? (
            <View style={styles.selectedCard}>
              <View style={styles.selectedInfo}>
                <Text style={styles.selectedName}>{selected.name}</Text>
                <Text style={styles.selectedMeta}>{selected.customId} · {selected.email}</Text>
              </View>
              <Pressable onPress={() => setSelected(null)}>
                <Text style={styles.changeText}>Change</Text>
              </Pressable>
            </View>
          ) : (
            /* Results */
            results.length > 0 && (
              <View style={styles.resultsList}>
                {results.map((user, index) => (
                  <Pressable
                    key={user._id}
                    style={({ pressed }) => [
                      styles.resultItem,
                      pressed && { opacity: 0.7 },
                      index < results.length - 1 && styles.resultBorder,
                    ]}
                    onPress={() => {
                      setSelected(user);
                      setResults([]);
                      setQuery('');
                    }}
                  >
                    <Text style={styles.resultName}>{user.name}</Text>
                    <Text style={styles.resultMeta}>{user.customId} · {user.email}</Text>
                  </Pressable>
                ))}
              </View>
            )
          )}

          {query.length >= 3 && !searching && results.length === 0 && !selected && (
            <Text style={styles.noResults}>No patients found</Text>
          )}

          {/* Action */}
          <Pressable
            style={({ pressed }) => [
              styles.linkBtn,
              (!selected || linking) && styles.linkBtnDisabled,
              pressed && selected && { opacity: 0.85 },
            ]}
            onPress={handleLink}
            disabled={!selected || linking}
          >
            {linking
              ? <ActivityIndicator color={colors.white} size="small" />
              : <Text style={styles.linkBtnText}>Link patient</Text>
            }
          </Pressable>

        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: typography.subheading,
    fontWeight: '700',
    color: colors.textDark,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.textGrey + '18',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 18,
    lineHeight: 18,
    color: colors.textGrey,
    fontWeight: '600',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    fontSize: typography.body,
    color: colors.textDark,
  },
  resultsList: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  resultItem: {
    padding: spacing.md,
    backgroundColor: colors.white,
  },
  resultBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  resultName: {
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.textDark,
  },
  resultMeta: {
    fontSize: typography.small,
    color: colors.textGrey,
    marginTop: 2,
  },
  noResults: {
    fontSize: typography.small,
    color: colors.textGrey,
    textAlign: 'center',
  },
  selectedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  selectedInfo: { gap: 2, flex: 1 },
  selectedName: {
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.textDark,
  },
  selectedMeta: {
    fontSize: typography.small,
    color: colors.textGrey,
  },
  changeText: {
    fontSize: typography.small,
    color: colors.primary,
    fontWeight: '600',
  },
  linkBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  linkBtnDisabled: {
    opacity: 0.4,
  },
  linkBtnText: {
    color: colors.white,
    fontSize: typography.body,
    fontWeight: '600',
  },
});