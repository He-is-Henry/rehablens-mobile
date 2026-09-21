import React from 'react';
import { Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '@/constants/theme';

type Props = {
  media?: ExerciseMedia[];
};

export function MediaViewer({ media }: Props) {
  if (!media || media.length === 0) return null;

  const item = media[0];
  const isVideo = item.type === 'video' || item.url.endsWith('.mp4');

  if (!isVideo) {
    return (
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.url }}
          style={styles.image}
          resizeMode="cover"
        />
        {item.caption && <Text style={styles.caption}>{item.caption}</Text>}
      </View>
    );
  }

  return (
    <Pressable
      style={({ pressed }) => [styles.videoCard, pressed && { opacity: 0.85 }]}
      onPress={() => Linking.openURL(item.url)}
    >
      <View style={styles.playIconContainer}>
        <Ionicons name="play" size={28} color={colors.white} />
      </View>
      <View style={styles.videoTextContainer}>
        <Text style={styles.videoTitle}>{item.caption || 'Watch Demo Video'}</Text>
        <Text style={styles.videoSub}>Opens video player</Text>
      </View>
      <Ionicons name="open-outline" size={20} color="rgba(255,255,255,0.6)" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    width: '100%',
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  image: {
    width: '100%',
    height: 200,
  },
  caption: {
    padding: spacing.sm,
    color: 'rgba(255,255,255,0.7)',
    fontSize: typography.small,
  },
  videoCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  playIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoTextContainer: {
    flex: 1,
  },
  videoTitle: {
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.white,
  },
  videoSub: {
    fontSize: typography.small,
    color: 'rgba(255,255,255,0.6)',
  },
});