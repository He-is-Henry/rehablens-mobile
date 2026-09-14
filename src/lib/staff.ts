import { apiClient } from "./apiClient";

export const getStaffPatients = async () =>
  apiClient.get<Link[]>("/staff/patients");

export const getStaffPatient = async (linkId: string) =>
  apiClient.get<Link>(`/staff/patients/${linkId}`);

export const createAssignment = async (payload: {
  patientId: string;
  exerciseId: string;
  customReps?: number;
  customHoldSeconds?: number;
  notes?: string;
}) => apiClient.post<Assignment>("/staff/assignment", payload);

export const getStaffPatientAssignments = async (linkId: string) =>
  apiClient.get<Assignment[]>(`/staff/patients/${linkId}/assignments`);

export const getStaffPatientAssignmentById = async (id: string) =>
  apiClient.get<Assignment>(`/staff/assignments/${id}`);

export const getStaffSessionResults = async (assignmentId: string) =>
  apiClient.get<SessionResult[]>(
    `/staff/assignments/${assignmentId}/session-results`,
  );
