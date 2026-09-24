// components/exercise/StreakCelebrationOverlay.tsx
import { radius, spacing, typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  visible: boolean;
  streakCount: number;
  onClose: () => void;
};

export function StreakCelebrationOverlay({ visible, streakCount, onClose }: Props) {
  const insets = useSafeAreaInsets();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const flamePulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.7);

      // Card pop sequence
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 90,
          useNativeDriver: true,
        }),
      ]).start();

      // Continuous Flame Pulse Loop
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(flamePulse, {
            toValue: 1.15,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(flamePulse, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
        ]),
      );
      pulseLoop.start();

      return () => pulseLoop.stop();
    }
  }, [visible]);

  return (
    <Modal visible={visible} animationType="none" transparent statusBarTranslucent>
      <Animated.View
        style={[
          styles.container,
          { opacity: fadeAnim, paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
          <Animated.View
            style={[styles.flameCircle, { transform: [{ scale: flamePulse }] }]}
          >
            <Ionicons name="flame" size={64} color="#f97316" />
          </Animated.View>

          <Text style={styles.streakTitle}>{streakCount} Day Streak!</Text>
          <Text style={styles.streakSub}>
            You&apos;re building consistency! Keep it up to reach your rehabilitation goals.
          </Text>

          <Pressable style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Awesome!</Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(10, 10, 10, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    backgroundColor: '#1c1917',
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.25)',
  },
  flameCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  streakTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#f97316',
  },
  streakSub: {
    fontSize: typography.body,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  button: {
    width: '100%',
    backgroundColor: '#f97316',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: typography.body,
    fontWeight: '700',
    color: '#fff',
  },
});