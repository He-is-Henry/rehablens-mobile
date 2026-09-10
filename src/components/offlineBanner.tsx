import { colors, spacing, typography } from '@/constants/theme';
import { useNetwork } from '@/context/network.context';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function OfflineBanner() {
  const { isOnline, isChecking, recheck } = useNetwork();
  const insets = useSafeAreaInsets();

  if (isOnline) return null;

  return (
    <Pressable
      style={[styles.banner, { paddingTop: insets.top + spacing.xs }]}
      onPress={recheck}
      disabled={isChecking}
    >
      {isChecking ? (
        <ActivityIndicator size="small" color={colors.white} />
      ) : (
        <>
          <Text style={styles.text}>You&apos;re offline — showing cached data</Text>
          <Text style={styles.retry}>Tap to retry ↺</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.error,
    paddingBottom: spacing.xs + 4,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    zIndex: 100,
  },
  text: {
    color: colors.white,
    fontSize: typography.small,
    fontWeight: '600',
  },
  retry: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: typography.label,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});