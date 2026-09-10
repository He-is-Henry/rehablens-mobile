import { colors, radius, spacing, typography } from '@/constants/theme';
import { searchHospitals } from '@/lib/hospital';
import { requestHospitalLink } from '@/lib/patient';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator, Modal, Pressable,
  StyleSheet,
  Text, TextInput, View
} from 'react-native';
import Toast from 'react-native-toast-message';

type Props = { close(): void; onRequested(): void };

export default function RequestHospitalModal({ close, onRequested }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Hospital[]>([]);
  const [selected, setSelected] = useState<Hospital | null>(null);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback((text: string) => {
    setQuery(text);
    setSelected(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (text.trim().length < 3) { setResults([]); return; }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        setResults(await searchHospitals(text));
      } finally {
        setSearching(false);
      }
    }, 300);
  }, []);

  const handleRequest = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      await requestHospitalLink(selected._id);
      Toast.show({ type: 'success', text1: 'Request sent', text2: 'Waiting on hospital confirmation' });
      onRequested();
      close();
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Request failed', text2: e.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal transparent statusBarTranslucent animationType="fade" onRequestClose={close}>
      <Pressable style={styles.overlay} onPress={close}>
        <Pressable style={styles.card} onPress={() => { }}>
          <View style={styles.header}>
            <Text style={styles.title}>Link a hospital</Text>
            <Pressable onPress={close} hitSlop={8} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>×</Text>
            </Pressable>
          </View>

          <TextInput
            style={styles.input}
            value={query}
            onChangeText={handleSearch}
            placeholder="Search by name or ID (min 3)"
            placeholderTextColor={colors.textGrey}
          />
          {searching && <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xs }} />}

          {selected ? (
            <View style={styles.selectedCard}>
              <View>
                <Text style={styles.selectedName}>{selected.name}</Text>
                <Text style={styles.selectedMeta}>{selected.customId}</Text>
              </View>
              <Pressable onPress={() => setSelected(null)}>
                <Text style={styles.changeText}>Change</Text>
              </Pressable>
            </View>
          ) : (
            results.length > 0 && (
              <View style={styles.resultsList}>
                {results.map((h, i, arr) => (
                  <Pressable
                    key={h._id}
                    style={[styles.resultItem, i < arr.length - 1 && styles.resultBorder]}
                    onPress={() => { setSelected(h); setResults([]); setQuery(''); }}
                  >
                    <Text style={styles.resultName}>{h.name}</Text>
                    <Text style={styles.resultMeta}>{h.customId}</Text>
                  </Pressable>
                ))}
              </View>
            )
          )}

          <Pressable
            style={({ pressed }) => [
              styles.requestBtn,
              (!selected || submitting) && styles.requestBtnDisabled,
              pressed && selected && { opacity: 0.85 },
            ]}
            onPress={handleRequest}
            disabled={!selected || submitting}
          >
            {submitting
              ? <ActivityIndicator color={colors.white} size="small" />
              : <Text style={styles.requestBtnText}>Send request</Text>
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
  selectedName: {
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.textDark,
  },
  selectedMeta: {
    fontSize: typography.small,
    color: colors.textGrey,
    marginTop: 2,
  },
  changeText: {
    fontSize: typography.small,
    color: colors.primary,
    fontWeight: '600',
  },
  requestBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  requestBtnDisabled: {
    opacity: 0.4,
  },
  requestBtnText: {
    color: colors.white,
    fontSize: typography.body,
    fontWeight: '600',
  },
});