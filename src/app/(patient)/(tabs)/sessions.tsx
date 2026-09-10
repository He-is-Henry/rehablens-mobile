import { colors, spacing, typography } from '@/constants/theme';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SessionFeed from '../components/SessionFeed';

export default function MyExercisesScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Text style={styles.title}>Sessions history</Text>
      </View>
      <View style={styles.content}>
        <SessionFeed />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md
  },
  title: {
    fontSize: typography.subheading,
    fontWeight: '700',
    color: colors.textDark
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg
  },
});