import { colors, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/context/auth.context';
import { useRefresh } from '@/hooks/useRefresh';
import { usePatientQuery } from '@/queries/patient';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HospitalTabs } from '../components/leaderboard/HospitalTabs';
import { LeaderboardRow } from '../components/leaderboard/LeaderboardRow';
import { RankUpModal } from '../components/leaderboard/RankUpModal';
import { TimeframeToggle } from '../components/leaderboard/TimeframeToggle';

export default function LeaderboardScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const navigation = useNavigation();
  const [lifetime, setLifetime] = useState(false);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(null);

  const flatListRef = useRef<FlatList>(null);
  const isAnimatingRef = useRef(false);

  const params = useLocalSearchParams<{
    rankMovedUp?: string;
    previousRank?: string;
    newRank?: string;
  }>();

  const [modalVisible, setModalVisible] = useState(false);

  // Determine if we are currently in the rank-up animation flow
  const isRankUpFlow = params.rankMovedUp === 'true';

  // 1. Fetch leaderboard data.
  // When in rank-up flow, pass `revalidate = false` to return the cached/old version
  // so the list displays the user's previous rank before climbing up.
  const { data: leaderboard, loading, refreshData } = usePatientQuery.leaderboard(
    lifetime,
    !isRankUpFlow
  );

  const activeHospital = useMemo(() => {
    if (!leaderboard?.length) return null;
    const id = selectedHospitalId ?? leaderboard[0].hospitalId;
    return leaderboard.find((h) => h.hospitalId === id) ?? leaderboard[0];
  }, [leaderboard, selectedHospitalId]);

  const { onRefreshControl, refreshing } = useRefresh(refreshData);

  // 2. Coordinated activation hook loop for Rank Up transition
  useEffect(() => {
    if (isRankUpFlow && params.previousRank && params.newRank && !loading && leaderboard) {
      setLifetime(true);
      setModalVisible(true);

      // Lock automatic refreshes while animation sequence is prepared
      isAnimatingRef.current = true;

      const patientsList = activeHospital?.patients ?? [];
      const prevIndex = Math.min(parseInt(params.previousRank, 10) - 1, patientsList.length - 1);

      if (prevIndex >= 0) {
        setTimeout(() => {
          // Snap down to previous rank position instantly before modal opens
          flatListRef.current?.scrollToIndex({
            index: prevIndex,
            animated: false,
            viewPosition: 0.5,
          });
        }, 50);
      }
    }
  }, [isRankUpFlow, params.previousRank, params.newRank, loading, leaderboard, activeHospital]);

  const runRankClimbAnimation = () => {
    if (!params.newRank || !activeHospital?.patients || !user?._id) {
      isAnimatingRef.current = false;
      return;
    }

    const patientsList = activeHospital.patients;
    const newIndex = patientsList.findIndex((p) => p.patientId === user._id);
    const targetIndex = newIndex !== -1 ? newIndex : Math.max(0, parseInt(params.newRank, 10) - 1);

    // Smoothly climb up to the target slot
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({
        index: targetIndex,
        animated: true,
        viewPosition: 0.3,
      });

      // Once animation settles, unlock, clear route params, and trigger background sync
      setTimeout(() => {
        isAnimatingRef.current = false;
        navigation.setParams({
          rankMovedUp: undefined,
          previousRank: undefined,
          newRank: undefined,
        } as any);

        // Fetch latest live data now that animation sequence is finished
        refreshData();
      }, 800);
    }, 150);
  };

  if (loading && !leaderboard) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!leaderboard?.length) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.emptyText}>No leaderboard data yet</Text>
        <Text style={styles.emptySub}>
          Link a verified hospital and complete a session to see rankings
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Leaderboard</Text>
        <TimeframeToggle lifetime={lifetime} onChange={setLifetime} />
      </View>

      <View style={styles.tabsWrap}>
        <HospitalTabs
          hospitals={leaderboard}
          selectedId={activeHospital?.hospitalId ?? null}
          onSelect={setSelectedHospitalId}
        />
      </View>

      <FlatList
        ref={flatListRef}
        data={activeHospital?.patients ?? []}
        keyExtractor={(item) => item.patientId}
        contentContainerStyle={styles.list}
        getItemLayout={(_, index) => ({
          length: 74, // Row container height + separator padding
          offset: 74 * index,
          index,
        })}
        onScrollToIndexFailed={(info) => {
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({
              index: info.index,
              animated: true,
              viewPosition: 0.3,
            });
          }, 100);
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              if (!isAnimatingRef.current) onRefreshControl();
            }}
          />
        }
        renderItem={({ item, index }) => (
          <LeaderboardRow
            entry={item}
            rank={index + 1}
            isSelf={item.patientId === user?._id}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>No completed sessions yet</Text>
          </View>
        }
      />

      <RankUpModal
        visible={modalVisible}
        previousRank={params.previousRank ?? '0'}
        newRank={params.newRank ?? '0'}
        onClose={() => {
          setModalVisible(false);
          runRankClimbAnimation();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.lg,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  title: {
    fontSize: typography.subheading,
    fontWeight: '700',
    color: colors.textDark,
  },
  tabsWrap: { paddingBottom: spacing.sm },
  list: { padding: spacing.md, gap: spacing.sm },
  emptyText: {
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.textDark,
  },
  emptySub: {
    fontSize: typography.small,
    color: colors.textGrey,
    textAlign: 'center',
  },
});