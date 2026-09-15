import { colors, radius, spacing, typography } from '@/constants/theme';
import * as Updates from 'expo-updates';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function UpdateBanner() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [reloading, setReloading] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (__DEV__) return;

    async function checkUpdate() {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          setUpdateAvailable(true);
        }
      } catch (e) {
        // Silently fail if update server is unreachable
      }
    }

    checkUpdate();
  }, []);

  if (!updateAvailable) return null;

  const handleReload = async () => {
    setReloading(true);
    await Updates.reloadAsync();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.xs }]}>
      <Text style={styles.text}>A new update is available.</Text>
      <Pressable style={styles.button} onPress={handleReload} disabled={reloading}>
        <Text style={styles.buttonText}>{reloading ? 'Updating...' : 'Reload now'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primaryDark,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm + 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 100,
  },
  text: {
    color: colors.white,
    fontSize: typography.body,
    fontWeight: '500',
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.sm,
  },
  buttonText: {
    color: colors.white,
    fontSize: typography.small,
    fontWeight: '700',
  },
});