import { colors, radius, spacing, typography } from '@/constants/theme';
import {
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native';

interface Props {
  sessions: Session[];
  currentSessionId?: string;
  onRevoke: (sessionId: string) => void;
  onRevokeAll: () => void;
}

export default function SessionList({ sessions, onRevoke, onRevokeAll }: Props) {
  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Active Sessions</Text>
        {sessions.length > 1 && (
          <Pressable onPress={onRevokeAll}>
            <Text style={styles.revokeAll}>Sign out all others</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.card}>
        {sessions.map((session, index) => (
          <View key={session._id}>
            <SessionCard
              session={session}
              onRevoke={() => onRevoke(session._id)}
            />
            {index < sessions.length - 1 && <View style={styles.divider} />}
          </View>
        ))}
      </View>
    </View>
  );
}

function SessionCard({
  session,
  onRevoke,
}: {
  session: Session;
  onRevoke: () => void;
}) {
  const createdAt = new Date(session.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const lastActive = new Date(session.updatedAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const isUnknown = !session.deviceInfo || session.deviceInfo === 'Unknown Device';

  const deviceIcon = isUnknown ? '❓' :
    session.deviceInfo.toLowerCase().includes('android') ? '🤖' :
      session.deviceInfo.toLowerCase().includes('ios') ? '🍎' :
        session.deviceInfo.toLowerCase().includes('windows') ? '🖥️' :
          session.deviceInfo.toLowerCase().includes('mac') ? '💻' : '📱';

  return (
    <View style={styles.sessionRow}>
      <View style={styles.sessionIcon}>
        <Text style={styles.sessionIconText}>{deviceIcon}</Text>
      </View>

      <View style={styles.sessionInfo}>
        <View style={styles.sessionTopRow}>
          <Text style={styles.deviceInfo} numberOfLines={1}>
            {isUnknown ? 'Unknown Device' : session.deviceInfo}
          </Text>
          {session.currentDevice && (
            <View style={styles.currentBadge}>
              <Text style={styles.currentBadgeText}>This device</Text>
            </View>
          )}
        </View>

        {session.location && (
          <Text style={styles.sessionMeta}>{session.location}</Text>
        )}

        <Text style={styles.sessionMeta}>{session.ipAddress}</Text>
        <Text style={styles.sessionMeta}>Signed in {createdAt}</Text>
        <Text style={styles.sessionMeta}>Last active {lastActive}</Text>
      </View>

      {!session.currentDevice && (
        <Pressable
          onPress={onRevoke}
          style={({ pressed }) => [styles.revokeBtn, pressed && { opacity: 0.7 }]}
          hitSlop={8}
        >
          <Text style={styles.revokeBtnText}>✕</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.label,
    fontWeight: '700',
    color: colors.textGrey,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  revokeAll: {
    fontSize: typography.small,
    color: colors.error,
    fontWeight: '500',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  sessionIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionIconText: {
    fontSize: 18,
  },
  sessionInfo: {
    flex: 1,
    gap: 2,
  },
  sessionTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  deviceInfo: {
    fontSize: typography.small,
    fontWeight: '600',
    color: colors.textDark,
    flex: 1,
  },
  sessionMeta: {
    fontSize: typography.label,
    color: colors.textGrey,
  },
  currentBadge: {
    backgroundColor: colors.primary + '18',
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  currentBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  revokeBtn: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.error + '12',
    alignItems: 'center',
    justifyContent: 'center',
  },
  revokeBtnText: {
    fontSize: 11,
    color: colors.error,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
});