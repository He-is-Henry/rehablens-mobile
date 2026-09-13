import { colors, radius, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/context/auth.context';
import { useQuery } from '@/hooks/useQuery';
import { getAllPatients, getAllStaff, getPatientByLinkId } from '@/lib/hospital';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native';
import CreateStaffModal from '../components/CreateStaffModal';
import LinkPatientModal from '../components/LinkPatientModal';
import PatientList from '../components/PatientList';
import StaffList from '../components/StaffList';

const hospitalPatientsQuery: Query<Link[]> = {
  key: '/hospital/patient',
  fetcher: getAllPatients,
}

const hospitalStaffQuery: Query<User[]> = {
  key: '/hospital/staff',
  fetcher: getAllStaff,
}

const TABS = ['Staff', 'Patients'] as const;
type Tab = typeof TABS[number];

export default function HospitalDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('Staff');

  const { data: staff, setData: setStaff, loading: staffLoading, refreshData: refreshStaff } = useQuery(hospitalStaffQuery);

  const { data: patients, setData: setPatients, loading: patientsLoading, refreshData: refreshPatients } = useQuery(hospitalPatientsQuery);

  const [showNewStaffModal, setShowNewstaffModal] = useState(false)
  const [showLinkPatientModal, setShowLinkPatientModal] = useState(false)

  const hospital = user?.hospitalId as any;


  const loading = patientsLoading && staffLoading;

  const addNewPatient = async (newPatientId: string) => {
    const patientLink = await getPatientByLinkId(newPatientId)

    setPatients((prev) => [...(prev ?? []), patientLink])
  }

  const addNewStaff = (staffLink: User) => {
    setStaff((prev) => [...(prev ?? []), staffLink])
  }

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.hospitalName}>{hospital?.name ?? 'Your Hospital'}</Text>
          <Text style={styles.adminMeta}>{user?.customId} · {user?.name}</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{hospital?.customId}</Text>
          </View>

        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => (
          <Pressable
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Modals */}
      {
        showNewStaffModal && <CreateStaffModal close={() => {
          setShowNewstaffModal(false)
        }}
          onCreated={addNewStaff} />
      }

      {
        showLinkPatientModal && <LinkPatientModal close={() => {
          setShowLinkPatientModal(false)
        }} onLinked={addNewPatient} />
      }

      {/* List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : activeTab === 'Staff' ? (
        <StaffList staff={staff ?? []} loadData={refreshStaff} setStaff={setStaff} />
      ) : (
        <PatientList patients={patients ?? []} loadData={refreshPatients} setPatient={setPatients} />
      )}

      {/* FAB */}
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && { opacity: 0.85 }]}
        onPress={() => {
          console.log(activeTab === 'Staff' ? 'Add staff' : 'Link patient');
          if (activeTab === "Staff") setShowNewstaffModal(true); else if (activeTab == "Patients") setShowLinkPatientModal(true)
        }}
      >
        <Text style={styles.fabText}>+</Text>
      </Pressable>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primaryDark,
    paddingTop: spacing.xl + spacing.lg,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  hospitalName: {
    fontSize: typography.subheading,
    fontWeight: '700',
    color: colors.white,
    marginBottom: spacing.xs,
  },
  adminMeta: {
    fontSize: typography.small,
    color: 'rgba(255,255,255,0.6)',
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  badgeText: {
    fontSize: typography.label,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  logoutBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  logoutText: {
    fontSize: typography.small,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: typography.body,
    color: colors.textGrey,
    fontWeight: '500',
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: {
    fontSize: 28,
    color: colors.white,
    fontWeight: '300',
    lineHeight: 32,
  },
});