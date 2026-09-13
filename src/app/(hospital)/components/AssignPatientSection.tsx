import { colors, radius, spacing, typography } from '@/constants/theme';
import { useQuery } from '@/hooks/useQuery';
import {
  assignStaffToPatient,
  getLinkedPatients
} from '@/lib/hospital';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import Toast from 'react-native-toast-message';

type Props = {
  staffId: string;
  excludeLinkIds: string[];
  onAssigned(link: Link): void;
  onSearchFocus?(): void;
}



export default function AssignPatientSection({ staffId, excludeLinkIds, onAssigned, onSearchFocus }: Props) {

  const hospitalPatientsQuery: Query<Link[]> = {
    key: '/hospital/patient',
    fetcher: () => getLinkedPatients(undefined, staffId)
  }

  const { data: links, loading } = useQuery(hospitalPatientsQuery)
  const [query, setQuery] = useState('');
  const [assigningId, setAssigningId] = useState('');


  const handleAssign = async (linkId: string) => {
    setAssigningId(linkId);
    try {
      const newLink = await assignStaffToPatient(linkId, staffId);
      Toast.show({ type: 'success', text1: 'Patient assigned' });
      onAssigned(newLink);
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Assign failed', text2: e.message });
    } finally {
      setAssigningId('');
    }
  };

  const results = links?.filter((link) => {
    if (excludeLinkIds.includes(link._id)) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      link.patientId.name.toLowerCase().includes(q) ||
      link.patientId.customId?.toLowerCase().includes(q)
    );
  });

  return (
    <View style={styles.section}>
      <Text style={styles.label}>Assign patient</Text>
      <TextInput
        value={query}
        onChangeText={setQuery}
        onFocus={onSearchFocus}
        style={styles.input}
        placeholder="Search patients..."
        placeholderTextColor={colors.textGrey}
      />

      {loading || !results ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : (
        <ScrollView style={styles.results} nestedScrollEnabled keyboardShouldPersistTaps="handled">
          {results.map((link) => (
            <View key={link._id} style={styles.row}>
              <View style={styles.rowInfo}>
                <Text style={styles.rowName}>{link.patientId.name}</Text>
                <Text style={styles.rowMeta}>
                  {link.patientId.customId}
                  {link.staffId ? ` · currently with ${link.staffId.name}` : ' · unassigned'}
                </Text>
              </View>
              <Pressable
                style={styles.assignBtn}
                onPress={() => handleAssign(link._id)}
                disabled={assigningId === link._id}
              >
                <Text style={styles.assignBtnText}>
                  {assigningId === link._id ? '...' : 'Assign'}
                </Text>
              </Pressable>
            </View>
          ))}
          {results.length === 0 && (
            <Text style={styles.empty}>No matching patients</Text>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.xs
  },
  label: {
    fontSize: typography.label,
    fontWeight: '600',
    color: colors.textDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
  loader: {
    paddingVertical: spacing.md
  },
  results: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    height: 200,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  rowInfo: {
    flex: 1
  },
  rowName: {
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.textDark
  },
  rowMeta: {
    fontSize: typography.small,
    color: colors.textGrey,
    marginTop: 2
  },
  assignBtn: {

    backgroundColor: colors.primary + '18',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  assignBtnText: {
    fontSize: typography.label,
    fontWeight: '600',
    color: colors.primary
  },
  empty: {
    fontSize: typography.small,
    color: colors.textGrey,
    textAlign: 'center',
    padding: spacing.md
  },
});