import { colors, radius, spacing, typography } from '@/constants/theme';
import { searchHospitals } from '@/lib/hospital';
import { registerPatient } from '@/lib/patient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';

interface HospitalResult {
  _id: string;
  name: string;
  address: string;
  customId: string;
}

export default function PatientRegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [hospitalQuery, setHospitalQuery] = useState('');
  const [hospitalResults, setHospitalResults] = useState<HospitalResult[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<HospitalResult | null>(null);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleHospitalSearch = useCallback((text: string) => {
    setHospitalQuery(text);
    setSelectedHospital(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (text.trim().length < 3) {
      setHospitalResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchHospitals(text);
        setHospitalResults(results ?? []);
      } finally {
        setSearching(false);
      }
    }, 300);
  }, []);

  const handleSelectHospital = (hospital: HospitalResult) => {
    setSelectedHospital(hospital);
    setHospitalQuery('');
    setHospitalResults([]);
  };

  const handleSubmit = async () => {
    if (!name || !email || !password || !selectedHospital) {
      Toast.show({ type: 'error', text1: 'All fields are required' });
      return;
    }

    setLoading(true);
    try {
      await registerPatient({
        name,
        email,
        password,
        hospitalId: selectedHospital._id,
      });
      Toast.show({ type: 'success', text1: 'Account created', text2: 'You can now log in' });
      router.replace('/(auth)/login');
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Registration failed',
        text2: err?.message ?? 'Something went wrong',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <InputGroup label="Full Name">
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Your full name"
          placeholderTextColor={colors.textGrey}
          autoCapitalize="words"
        />
      </InputGroup>

      <InputGroup label="Email">
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          placeholderTextColor={colors.textGrey}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </InputGroup>

      <InputGroup label="Password">
        <View style={styles.passwordRow}>
          <TextInput
            style={[styles.input, styles.passwordInput]}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={colors.textGrey}
            secureTextEntry={!showPassword}
          />
          <Pressable
            style={styles.eyeBtn}
            onPress={() => setShowPassword(p => !p)}
          >
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={20}
              color={colors.textGrey}
            />
          </Pressable>
        </View>
      </InputGroup>

      <InputGroup label="Hospital">
        {selectedHospital ? (
          <Pressable
            style={styles.selectedCard}
            onPress={() => setSelectedHospital(null)}
          >
            <View style={styles.selectedCardInfo}>
              <Text style={styles.selectedName}>{selectedHospital.name}</Text>
              <Text style={styles.selectedMeta}>{selectedHospital.customId}</Text>
              <Text style={styles.selectedMeta}>{selectedHospital.address}</Text>
            </View>
            <Text style={styles.changeText}>Change</Text>
          </Pressable>
        ) : (
          <>
            <View style={styles.searchRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={hospitalQuery}
                onChangeText={handleHospitalSearch}
                placeholder="Search by name or ID (min 3 chars)"
                placeholderTextColor={colors.textGrey}
              />
              {searching && (
                <ActivityIndicator
                  size="small"
                  color={colors.primary}
                  style={styles.searchSpinner}
                />
              )}
            </View>

            {hospitalResults.length > 0 && (
              <View style={styles.resultsList}>
                {hospitalResults.map((h) => (
                  <Pressable
                    key={h._id}
                    style={({ pressed }) => [styles.resultItem, pressed && { opacity: 0.7 }]}
                    onPress={() => handleSelectHospital(h)}
                  >
                    <Text style={styles.resultName}>{h.name}</Text>
                    <Text style={styles.resultMeta}>{h.customId} · {h.address}</Text>
                  </Pressable>
                ))}
              </View>
            )}

            {hospitalQuery.length >= 3 && !searching && hospitalResults.length === 0 && (
              <Text style={styles.noResults}>No hospitals found</Text>
            )}
          </>
        )}
      </InputGroup>

      <Pressable
        style={({ pressed }) => [styles.button, pressed && { opacity: 0.85 }]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color={colors.white} />
          : <Text style={styles.buttonText}>Create account</Text>
        }
      </Pressable>
    </ScrollView>
  );
}

function InputGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  inputGroup: { gap: spacing.xs },
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
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    borderRightWidth: 0,
  },
  eyeBtn: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopRightRadius: radius.md,
    borderBottomRightRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  searchSpinner: { marginLeft: spacing.xs },
  resultsList: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    overflow: 'hidden',
    marginTop: spacing.xs,
  },
  resultItem: {
    padding: spacing.md,
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
    marginTop: spacing.sm,
  },
  selectedCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedCardInfo: { gap: 2, flex: 1 },
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
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  buttonText: {
    color: colors.white,
    fontSize: typography.body,
    fontWeight: '600',
  },
});