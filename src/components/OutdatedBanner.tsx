import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { config } from '@/config';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/context/auth.context';

const SNOOZE_KEY = 'snooze_update_until';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

type Props = {
  inline?: boolean;
};

export function OutdatedBanner({ inline = false }: Props) {
  const [modalVisible, setModalVisible] = useState(false);
  const insets = useSafeAreaInsets();
  const { user, requireStorage } = useAuth();

  const storage = requireStorage();

  useEffect(() => {
    if (inline || !config.isOutdated || !user) return;

    checkSnoozeStatus();
  }, [inline, user?._id]);

  const checkSnoozeStatus = async () => {
    try {
      const snoozedData = await storage.get<number>(SNOOZE_KEY);
      const snoozedUntil = snoozedData?.data;

      if (snoozedUntil && Date.now() < snoozedUntil) {
        return;
      }
      setModalVisible(true);
    } catch (e) {
      setModalVisible(true);
    }
  };

  const handleOpenDownload = () => {
    if (config.downloadUrl) {
      Linking.openURL(config.downloadUrl);
    }
  };

  const handleSnooze = async () => {
    try {
      const snoozeUntil = Date.now() + SEVEN_DAYS_MS;
      await storage.set(SNOOZE_KEY, snoozeUntil);
    } catch (e) {
      console.error('Failed to save snooze timestamp', e);
    } finally {
      setModalVisible(false);

      setTimeout(() => {
        Toast.show({
          type: 'info',
          text1: 'Update Postponed',
          text2: 'You can update anytime from your Profile screen.',
        });
      }, 300);
    }
  };

  if (!config.isOutdated || !user) return null;

  // --- INLINE PROFILE CARD MODE ---
  if (inline) {
    return (
      <View style={styles.inlineCard}>
        <View style={styles.inlineHeader}>
          <Ionicons name="arrow-up-circle-outline" size={24} color={colors.primary} />
          <View style={styles.inlineTextGroup}>
            <Text style={styles.inlineTitle}>App Update Available</Text>
            <Text style={styles.inlineSub}>A newer version of RehabLens is ready.</Text>
          </View>
        </View>
        <Pressable
          style={({ pressed }) => [styles.inlineButton, pressed && { opacity: 0.85 }]}
          onPress={handleOpenDownload}
        >
          <Text style={styles.inlineButtonText}>Update Now</Text>
        </Pressable>
      </View>
    );
  }

  // --- LAUNCH BOTTOM-SHEET MODAL MODE ---
  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="slide"
      onRequestClose={handleSnooze} // Respects Android hardware Back key
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.bottomSheet,
            { paddingBottom: Math.max(insets.bottom + spacing.md, spacing.xl) }, // Clear system navigation keys
          ]}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="arrow-up-circle" size={48} color={colors.primary} />
          </View>

          <Text style={styles.modalTitle}>Update Available</Text>
          <Text style={styles.modalDescription}>
            A new version of RehabLens is available with performance improvements and bug fixes.
          </Text>

          <View style={styles.actionColumn}>
            <Pressable
              style={({ pressed }) => [styles.primaryButton, pressed && { opacity: 0.85 }]}
              onPress={handleOpenDownload}
            >
              <Text style={styles.primaryButtonText}>Update Now</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.secondaryButton, pressed && { opacity: 0.7 }]}
              onPress={handleSnooze}
            >
              <Text style={styles.secondaryButtonText}>Later (Remind in 7 days)</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconContainer: {
    marginBottom: spacing.xs,
  },
  modalTitle: {
    fontSize: typography.subheading,
    fontWeight: '700',
    color: colors.textDark,
  },
  modalDescription: {
    fontSize: typography.body,
    color: colors.textGrey,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  actionColumn: {
    width: '100%',
    gap: spacing.sm,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: typography.body,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.textGrey,
    fontSize: typography.small,
    fontWeight: '500',
  },

  // Inline Profile Mode
  inlineCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginTop: spacing.lg,
    marginHorizontal: spacing.lg,
    gap: spacing.md,
  },
  inlineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  inlineTextGroup: {
    flex: 1,
  },
  inlineTitle: {
    fontSize: typography.body,
    fontWeight: '700',
    color: colors.textDark,
  },
  inlineSub: {
    fontSize: typography.small,
    color: colors.textGrey,
    marginTop: 2,
  },
  inlineButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  inlineButtonText: {
    color: colors.white,
    fontSize: typography.small,
    fontWeight: '600',
  },
});