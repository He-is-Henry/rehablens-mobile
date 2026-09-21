import { colors, spacing, typography } from '@/constants/theme';
import Constants from 'expo-constants';
import { StyleSheet, Text, View } from 'react-native';

export default function VersionFooter() {
  const version = Constants.expoConfig?.version ?? '1.1.0';
  // Uncomment when you release your first OTA update:
  // const otaVersion = Constants.expoConfig?.extra?.otaVersion;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        RehabLens v{version}
        {/* {otaVersion ? ` · ${otaVersion}` : ''} */}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  text: {
    fontSize: typography.small,
    color: colors.textGrey,
    fontWeight: '500',
  },
});