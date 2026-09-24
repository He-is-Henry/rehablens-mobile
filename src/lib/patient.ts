import { apiClient } from "./apiClient";

export const registerPatient = async (data: {
  name: string;
  email: string;
  password: string;
  hospitalId: string;
}) => apiClient.post("/patient/signup", data);

export const getPatientHospitals = async () =>
  apiClient.get<Link[]>("/patient/hospitals");

export const getPatientHospitalById = async (linkId?: string) =>
  apiClient.get<Link>(`/patient/hospitals/${linkId}`);

export const getPatientSchedules = async (params?: {
  date?: string;
  cursor?: string;
  limit?: number;
}) => apiClient.get<Schedule[]>("/patient/schedules", { params });

export const getPatientScheduleById = async (id: string) =>
  apiClient.get<Schedule>(`/patient/schedules/${id}`);

export const startSessionResult = async (payload: {
  scheduleId: string;
  assignmentId: string;
  timeZone: string;
}) =>
  apiClient.post<{ _id: string }>("/patient/session-results/start", payload);

export const finishSessionResult = async (
  id: string,
  payload: {
    repsCompleted: number;
    durationSeconds: number;
    status?: "completed" | "abandoned";
    timeZone: string;
  },
) =>
  apiClient.patch<{
    session: SessionResult;
    pointsAwarded: number;
    newStreak: number;
    streakExtended: boolean;
    rankMovedUp: boolean;
    previousRank: number;
    newRank: number;
  }>(`/patient/session-results/${id}/finish`, payload);

export const getPatientSessionResults = async () =>
  apiClient.get<PopulatedSessionResult[]>("/patient/session-results");

export const getPatientSessionResultsByAssignment = async (
  assignmentId: string,
) => apiClient.get<SessionResult[]>(`/patient/session-results/${assignmentId}`);

export const requestHospitalLink = async (hospitalId: string) =>
  apiClient.post<Link>(`/patient/hospitals/${hospitalId}`);

export const getLeaderboard = async (lifetime?: boolean) =>
  apiClient.get<Leaderboard>("/patient/leaderboard", {
    params: {
      timeframe: lifetime ? "lifetime" : "weekly",
    },
  });
