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

export const updateStaffAssignment = async (
  id: string,
  payload: Partial<
    Pick<Assignment, "status" | "notes" | "customReps" | "customHoldSeconds">
  >,
) => apiClient.patch<Assignment>(`/staff/assignments/${id}`, payload);

export const deleteStaffAssignment = async (id: string) =>
  apiClient.delete(`/staff/assignments/${id}`);

export const getStaffAssignmentSchedules = async (assignmentId: string) =>
  apiClient.get<Schedule[]>(`/staff/assignment/${assignmentId}/schedules`);

export const createStaffSchedules = async (
  assignmentId: string,
  entries: {
    scheduledDate: string;
    minSessions: number;
    maxSessions: number;
  }[],
) =>
  apiClient.post<Schedule[]>(`/staff/assignment/${assignmentId}/schedules`, {
    entries,
  });

export const updateStaffSchedule = async (
  scheduleId: string,
  payload: Partial<
    Pick<Schedule, "minSessions" | "maxSessions" | "scheduledDate">
  >,
) => apiClient.patch<Schedule>(`/staff/schedules/${scheduleId}`, payload);

export const deleteStaffSchedule = async (scheduleId: string) =>
  apiClient.delete<Schedule>(`/staff/schedules/${scheduleId}`);
