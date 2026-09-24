import { useQuery } from "@/hooks/useQuery";
import {
  getLeaderboard,
  getPatientHospitalById,
  getPatientHospitals,
  getPatientScheduleById,
  getPatientSchedules,
  getPatientSessionResults,
  getPatientSessionResultsByAssignment,
} from "@/lib/patient";

export const usePatientQuery = {
  hospitals: (options?: { revalidate: boolean }) =>
    useQuery<Link[]>({
      key: "/patient/hospitals",
      fetcher: getPatientHospitals,
      revalidate: options?.revalidate ?? true,
    }),
  hospitalById: (id?: string) =>
    useQuery({
      key: `/patient/hospitals/${id}`,
      enabled: !!id,
      fetcher: () => getPatientHospitalById(id!),
    }),
  sessionResults: (assignmentId: string) =>
    useQuery<SessionResult[]>({
      key: `/patient/session-results/${assignmentId}`,
      fetcher: () => getPatientSessionResultsByAssignment(assignmentId),
    }),

  schedules: (
    params?: {
      date?: string;
      cursor?: string;
      limit?: number;
      hospitalId?: string;
    },
    enabled?: boolean,
  ) =>
    useQuery<Schedule[]>({
      key: `/patient/schedules?date=${params?.date ?? ""}&cursor=${params?.cursor ?? ""}&limit=${params?.limit ?? ""}&hospitalId=${params?.hospitalId ?? ""}`,
      fetcher: () => getPatientSchedules(params),
      enabled: enabled,
    }),

  scheduleById: (id: string) =>
    useQuery<Schedule>({
      key: `/patient/schedules/${id}`,
      enabled: !!id,
      fetcher: () => getPatientScheduleById(id),
    }),

  allSessionResults: () =>
    useQuery<PopulatedSessionResult[]>({
      key: "/patient/session-results/",
      fetcher: getPatientSessionResults,
    }),

  leaderboard: (lifetime?: boolean, revalidate = true) =>
    useQuery<Leaderboard>({
      key: `/patient/leaderboard/${lifetime ? "lifetime" : "weekly"}`,
      fetcher: () => getLeaderboard(lifetime),
      revalidate,
    }),
};
