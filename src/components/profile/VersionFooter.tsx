import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Constants from 'expo-constants';
import { colors, spacing, typography } from '@/constants/theme';

export default function VersionFooter() {
  const version = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <View style={styles.container}>
      <Text style={styles.text}>RehabLens v{version}</Text>
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
