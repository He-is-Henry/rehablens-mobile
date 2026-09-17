import NotificationBell from '@/components/NotificationBell';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/context/auth.context';
import { getAdminTimeseries } from '@/lib/admin';
import { useAdminQuery } from '@/queries/admin';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const METRICS = ['registrations', 'sessions', 'errors'] as const;
type Metric = typeof METRICS[number];

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const { data: stats, loading: statsLoading, refreshData: refreshStats } = useAdminQuery.stats();
  const { data: requestStats, loading: requestLoading, refreshData: refreshRequestStats } = useAdminQuery.requestStats();

  const [metric, setMetric] = useState<Metric>('registrations');
  const [timeseries, setTimeseries] = useState<DayCount[]>([]);
  const [timeseriesLoading, setTimeseriesLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadTimeseries = async (m: Metric) => {
    setTimeseriesLoading(true);
    try {
      const data = await getAdminTimeseries(m, 14);
      setTimeseries(data);
    } finally {
      setTimeseriesLoading(false);
    }
  };

  useEffect(() => {
    loadTimeseries(metric);
  }, [metric]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshStats(), refreshRequestStats(), loadTimeseries(metric)]);
    setRefreshing(false);
  };

  const loading = statsLoading && !stats;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <View>
          <Text style={styles.title}>Admin</Text>
          <Text style={styles.meta}>{user?.name} · {user?.customId}</Text>
        </View>
        <NotificationBell />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
        >
          {/* Overview stat grid */}
          <Text style={styles.sectionLabel}>Overview</Text>
          <View style={styles.statGrid}>
            <StatBox label="Hospitals" value={stats?.totalHospitals} />
            <StatBox label="Staff" value={stats?.totalStaff} />
            <StatBox label="Patients" value={stats?.totalPatients} />
            <StatBox label="Sessions" value={stats?.totalSessions} />
          </View>

          {/* Today's activity */}
          <Text style={styles.sectionLabel}>Today</Text>
          <View style={styles.statGrid}>
            <StatBox label="New registrations" value={stats?.registeredToday} accent />
            <StatBox label="Sessions completed" value={stats?.sessionsToday} accent />
          </View>

          {/* Request performance */}
          <Text style={styles.sectionLabel}>Request performance</Text>
          {requestLoading && !requestStats ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.md }} />
          ) : (
            <>
              <View style={styles.statGrid}>
                <StatBox label="Total requests" value={requestStats?.totalRequests} />
                <StatBox label="Avg duration" value={requestStats?.avgDuration} suffix="ms" />
                <StatBox
                  label="Errors"
                  value={requestStats?.errorCount}
                  danger={!!requestStats?.errorCount}
                />
              </View>

              {requestStats && requestStats.slowestEndpoints.length > 0 && (
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Slowest endpoints</Text>
                  {requestStats.slowestEndpoints.slice(0, 5).map((e, i) => (
                    <View key={i} style={styles.endpointRow}>
                      <Text style={styles.endpointText} numberOfLines={1}>
                        {e._id.method} {e._id.url}
                      </Text>
                      <Text style={styles.endpointValue}>{Math.round(e.avgDuration)}ms</Text>
                    </View>
                  ))}
                </View>
              )}

              {requestStats && requestStats.errorProneEndpoints.length > 0 && (
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Error-prone endpoints</Text>
                  {requestStats.errorProneEndpoints.slice(0, 5).map((e, i) => (
                    <View key={i} style={styles.endpointRow}>
                      <Text style={styles.endpointText} numberOfLines={1}>
                        {e._id.method} {e._id.url}
                      </Text>
                      <Text style={styles.endpointValueDanger}>
                        {e.errors}/{e.total} ({Math.round(e.errorRate * 100)}%)
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}

          {/* Timeseries */}
          <Text style={styles.sectionLabel}>Trends (14 days)</Text>
          <View style={styles.metricTabs}>
            {METRICS.map((m) => (
              <Text
                key={m}
                onPress={() => setMetric(m)}
                style={[styles.metricTab, metric === m && styles.metricTabActive]}
              >
                {m}
              </Text>
            ))}
          </View>

          {timeseriesLoading ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.md }} />
          ) : timeseries.length === 0 ? (
            <Text style={styles.emptyText}>No data for this period</Text>
          ) : (
            <View style={styles.card}>
              {timeseries.map((d) => (
                <View key={d._id} style={styles.dayRow}>
                  <Text style={styles.dayLabel}>{d._id}</Text>
                  <View style={styles.dayBarTrack}>
                    <View
                      style={[
                        styles.dayBarFill,
                        { width: `${Math.min((d.count / (Math.max(...timeseries.map(t => t.count)) || 1)) * 100, 100)}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.dayCount}>{d.count}</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

function StatBox({
  label,
  value,
  accent,
  danger,
  suffix,
}: {
  label: string;
  value?: number;
  accent?: boolean;
  danger?: boolean;
  suffix?: string;
}) {
  return (
    <View style={styles.statBox}>
      <Text
        style={[
          styles.statValue,
          accent && { color: colors.accent },
          danger && { color: colors.error },
        ]}
      >
        {value ?? '—'}{suffix ?? ''}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primaryDark,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  title: {
    fontSize: typography.subheading,
    fontWeight: '700',
    color: colors.white,
  },
  meta: {
    fontSize: typography.small,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: spacing.lg, gap: spacing.sm },
  sectionLabel: {
    fontSize: typography.label,
    fontWeight: '700',
    color: colors.textGrey,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statBox: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  statLabel: {
    fontSize: typography.small,
    color: colors.textGrey,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  cardTitle: {
    fontSize: typography.small,
    fontWeight: '700',
    color: colors.textDark,
    marginBottom: spacing.xs,
  },
  endpointRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  endpointText: {
    fontSize: typography.small,
    color: colors.textDark,
    flex: 1,
    marginRight: spacing.sm,
  },
  endpointValue: {
    fontSize: typography.small,
    color: colors.textGrey,
    fontWeight: '600',
  },
  endpointValueDanger: {
    fontSize: typography.small,
    color: colors.error,
    fontWeight: '600',
  },
  metricTabs: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  metricTab: {
    fontSize: typography.small,
    color: colors.textGrey,
    fontWeight: '600',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    textTransform: 'capitalize',
    overflow: 'hidden',
  },
  metricTabActive: {
    color: colors.white,
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 4,
  },
  dayLabel: {
    fontSize: typography.label,
    color: colors.textGrey,
    width: 76,
  },
  dayBarTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  dayBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  dayCount: {
    fontSize: typography.small,
    color: colors.textDark,
    fontWeight: '600',
    width: 24,
    textAlign: 'right',
  },
  emptyText: {
    fontSize: typography.small,
    color: colors.textGrey,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
});