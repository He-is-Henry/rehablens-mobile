import ScheduleCard from '@/components/ScheduleCard';
import { colors, spacing, typography } from '@/constants/theme';
import { useRefresh } from '@/hooks/useRefresh';
import { usePatientQuery } from '@/queries/patient';
import { router } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type Props = {
  hospitalId?: string;
  date?: string;
  emptyLabel?: string;
  emptySub?: string;
  headerLabel?: string;
  scroll?: boolean

  schedules?: Schedule[];
  loading?: boolean;
  onRefresh?: () => void;
};

export default function ScheduleList({
  scroll = false,
  hospitalId,
  date,
  emptyLabel = 'No schedules',
  emptySub = 'Nothing scheduled yet',
  headerLabel,
  schedules: externalSchedules,
  loading: externalLoading,
  onRefresh,
}: Props) {

  const hasExternalData = externalSchedules !== undefined;

  const internalQuery = usePatientQuery.schedules(
    { date, hospitalId },
    hasExternalData ? false : true
  );

  const schedules = hasExternalData ? externalSchedules : internalQuery.data;
  const loading = hasExternalData ? externalLoading : internalQuery.loading;

  const handleRefresh = async () => {
    if (onRefresh) {
      onRefresh();
    } else {
      await internalQuery.refreshData();
    }
  };

  const { refreshing, onRefreshControl } = useRefresh(handleRefresh);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (hasExternalData) {
    return (
      <View style={styles.list}>
        {headerLabel ? <Text style={styles.listHeader}>{headerLabel}</Text> : null}
        {schedules && schedules.length > 0 ? (
          schedules.map((item, index) => (
            <View key={item._id}>
              <ScheduleCard
                schedule={item}
                onPress={() =>
                  router.push({
                    pathname: '/(patient)/exercise/[scheduleId]',
                    params: { scheduleId: item._id },
                  })
                }
              />
              {index < schedules.length - 1 && <View style={{ height: spacing.sm }} />}
            </View>
          ))
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyLabel}>{emptyLabel}</Text>
            <Text style={styles.emptySub}>{emptySub}</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <FlatList
      data={schedules}
      keyExtractor={(item) => item._id}
      contentContainerStyle={styles.list}
      scrollEnabled={scroll}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefreshControl}
          tintColor={colors.primary}
        />
      }
      ListHeaderComponent={
        headerLabel ? <Text style={styles.listHeader}>{headerLabel}</Text> : null
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyLabel}>{emptyLabel}</Text>
          <Text style={styles.emptySub}>{emptySub}</Text>
        </View>
      }
      renderItem={({ item }) => (
        <ScheduleCard
          schedule={item}
          onPress={() =>
            router.push({
              pathname: '/(patient)/exercise/[scheduleId]',
              params: { scheduleId: item._id },
            })
          }
        />
      )}
      ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
    />
  );

}

const styles = StyleSheet.create({
  center: { paddingVertical: spacing.lg, alignItems: 'center' },
  list: { gap: spacing.sm },
  listHeader: {
    fontSize: typography.label,
    fontWeight: '700',
    color: colors.textGrey,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.xs,
  },
  emptyLabel: {
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