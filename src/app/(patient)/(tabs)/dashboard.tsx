import NotificationBell from '@/components/NotificationBell';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/context/auth.context';
import { useRefresh } from '@/hooks/useRefresh';
import { usePatientQuery } from '@/queries/patient';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RequestHospitalModal from '../components/RequestHospital';
import ScheduleList from '../components/ScheduleList';
import { StreakBadge } from '../components/StreakBadge';
import { WeekCalendarStrip } from '../components/WeekCalendar';

export default function PatientDashboard() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const { data: links, loading: linksLoading, refreshData: refreshLinks, setData: setLinks } = usePatientQuery.hospitals(); const [modalVisible, setModalVisible] = useState(false);

  const today = new Date();
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Calendar State
  const [selectedDate, setSelectedDate] = useState<string>(todayString);

  const isTodaySelected = selectedDate === todayString;


  const { data: schedules, loading: schedulesLoading, refreshData: refreshSchedules } = usePatientQuery.schedules(
    { date: selectedDate },
    true
  );

  const isGlobalLoading = linksLoading || (schedulesLoading && !schedules);

  const handleGlobalRefresh = async () => {
    await Promise.all([refreshLinks(), refreshSchedules()]);
  };

  const { refreshing, onRefreshControl } = useRefresh(handleGlobalRefresh);


  const addNewHospital = async (newLink: any) => {
    setLinks((p) => [...(p ?? []), newLink]);
  };
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <View style={styles.headerRow}>

          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0]} 👋</Text>
              <StreakBadge streak={user?.currentStreak ?? 0} />
            </View>
            <Text style={styles.meta}>{user?.customId}</Text>
          </View>
          <View style={styles.headerActions}>
            <NotificationBell />
            <Pressable
              style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.8 }]}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.addBtnText}>+ Link hospital</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Main Content List */}
      {isGlobalLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={links}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefreshControl}
              tintColor={colors.primary}
            />
          }
          ListHeaderComponent={
            <>
              {/* Interactive Calendar Strip */}
              <WeekCalendarStrip
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
              />

              {/* Dynamic Daily Schedule Section */}
              <View style={styles.todaySection}>
                <ScheduleList
                  schedules={schedules ?? []}
                  loading={schedulesLoading}
                  onRefresh={handleGlobalRefresh}
                  date={selectedDate}
                  headerLabel={isTodaySelected ? "Today" : `Schedule for ${selectedDate}`}
                  emptyLabel={isTodaySelected ? "Nothing scheduled today" : "No sessions scheduled"}
                  emptySub={isTodaySelected ? "Enjoy your rest day 🎉" : "No active exercises assigned for this date"} />
              </View>

              <Text style={styles.listHeader}>Your hospitals</Text>
            </>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyLabel}>No hospitals linked</Text>
              <Text style={styles.emptySub}>
                Link a hospital or ask them to add your account
              </Text>
              <Pressable
                style={styles.emptyBtn}
                onPress={() => setModalVisible(true)}
              >
                <Text style={styles.emptyBtnText}>Link hospital</Text>
              </Pressable>
            </View>
          }
          renderItem={({ item }) => {
            const hospital = item.hospitalId as any;
            const staff = item.staffId as any;

            return (
              <Pressable
                style={({ pressed }) => [
                  styles.card,
                  pressed && { opacity: 0.8 },
                ]}
                onPress={() =>
                  router.push({
                    pathname: '/(patient)/hospital/[linkId]',
                    params: { linkId: item._id },
                  })
                }
              >
                <View style={styles.cardHeader}>
                  <View style={styles.hospitalAvatar}>
                    <Text style={styles.hospitalAvatarText}>
                      {hospital?.name?.[0] ?? 'H'}
                    </Text>
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardName}>
                      {hospital?.name ?? '—'}
                    </Text>
                    <Text style={styles.cardMeta}>{hospital?.customId}</Text>
                    <Text style={styles.cardMeta}>{hospital?.address}</Text>
                  </View>
                  <View
                    style={[
                      styles.badge,
                      item.verified
                        ? styles.badgeVerified
                        : styles.badgePending,
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        item.verified
                          ? styles.badgeTextVerified
                          : styles.badgeTextPending,
                      ]}
                    >
                      {item.verified ? 'Verified' : 'Pending'}
                    </Text>
                  </View>
                </View>

                {staff ? (
                  <View style={styles.staffRow}>
                    <Text style={styles.staffLabel}>Your staff</Text>
                    <Text style={styles.staffName}>
                      {staff.name} · {staff.customId}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.unassigned}>No staff assigned yet</Text>
                )}
              </Pressable>
            );
          }}
        />
      )}

      {/* Link Hospital Modal */}
      {modalVisible && (
        <RequestHospitalModal
          close={() => setModalVisible(false)}
          onRequested={addNewHospital}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primaryDark,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greeting: {
    fontSize: typography.subheading,
    fontWeight: '700',
    color: colors.white,
    marginBottom: spacing.xs,
  },
  meta: {
    fontSize: typography.small,
    color: 'rgba(255,255,255,0.6)',
  },
  addBtn: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
  },
  addBtnText: {
    fontSize: typography.small,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: spacing.md, gap: spacing.sm },
  listHeader: {
    fontSize: typography.label,
    fontWeight: '700',
    color: colors.textGrey,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  hospitalAvatar: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hospitalAvatarText: {
    fontSize: typography.subheading,
    fontWeight: '700',
    color: colors.primary,
  },
  cardInfo: { flex: 1, gap: 2 },
  cardName: {
    fontSize: typography.body,
    fontWeight: '700',
    color: colors.textDark,
  },
  cardMeta: {
    fontSize: typography.small,
    color: colors.textGrey,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  badgeVerified: { backgroundColor: colors.success + '18' },
  badgePending: { backgroundColor: colors.accent + '25' },
  badgeText: { fontSize: typography.label, fontWeight: '700' },
  badgeTextVerified: { color: colors.success },
  badgeTextPending: { color: colors.accent },
  staffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  staffLabel: {
    fontSize: typography.small,
    color: colors.textGrey,
    fontWeight: '500',
  },
  staffName: {
    fontSize: typography.small,
    color: colors.textDark,
    fontWeight: '600',
  },
  unassigned: {
    fontSize: typography.small,
    color: colors.accent,
    fontStyle: 'italic',
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  empty: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
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
  emptyBtn: {
    marginTop: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  emptyBtnText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: typography.small,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  todaySection: {
    marginBottom: spacing.lg,
  },
});