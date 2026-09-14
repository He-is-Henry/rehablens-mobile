import { apiClient } from "./apiClient";

export const registerPatient = async (data: {
  name: string;
  email: string;
  password: string;
  hospitalId: string;
}) => apiClient.post("/patient/signup", data);

export const getPatientHospitals = async () =>
  apiClient.get<Link[]>("/patient/hospitals");

export const getPatientHospitalById = async (linkId: string) =>
  apiClient.get<Link>(`/patient/hospitals/${linkId}`);

export const getPatientAssignments = async (
  hospitalId?: string,
  status?: AssignmentStatus,
) =>
  apiClient.get<Assignment[]>("/patient/assignments", {
    params: { hospitalId, status },
  });

export const getPatientAssignmentById = async (id: string) =>
  apiClient.get<Assignment>(`/patient/assignments/${id}`);

export const createSessionResult = async (payload: {
  assignmentId: string;
  repsCompleted: number;
  targetReps: number;
  durationSeconds: number;
  status: "completed" | "abandoned";
}) => apiClient.post<SessionResult>("/patient/session-results", payload);

export const getPatientSessionResults = async () =>
  apiClient.get<PopulatedSessionResult[]>("/patient/session-results");

export const getPatientSessionResultsByAssignment = async (
  assignmentId: string,
) => apiClient.get<SessionResult[]>(`/patient/session-results/${assignmentId}`);

export const requestHospitalLink = async (hospitalId: string) =>
  apiClient.post<Link>(`/patient/hospitals/${hospitalId}`);
