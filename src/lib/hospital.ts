import { UserRole } from "@/types/role";
import { apiClient } from "./apiClient";

export const getAllStaff = async () => apiClient.get<User[]>("/hospital/staff");

export const getAllPatients = async () =>
  apiClient.get<Link[]>("/hospital/patient");

export const getPatientByLinkId = async (linkId: string) =>
  apiClient.get<Link>(`/hospital/patient/${linkId}`);

export const searchHospitals = async (q: string) =>
  apiClient.get<Hospital[]>(`/hospital/search?q=${q}`);

export const registerHospital = async (data: {
  name: string;
  email: string;
  address: string;
  phone: string;

  admin: {
    name: string;
    email: string;
    password: string;
  };
}) => apiClient.post("/hospital/register", data);

export const createStaff = async (data: {
  name: string;
  email: string;
  role: UserRole;
}) => apiClient.post<User>("/hospital/staff", data);

export const getStaffById = async (id: string) =>
  apiClient.get<User>(`/hospital/staff/${id}`);

export const updateStaff = async (
  id: string,
  payload: Partial<
    Pick<User, "name" | "email" | "role" | "isActive" | "isPioneer">
  >,
) => apiClient.patch<User>(`/hospital/staff/${id}`, payload);

export const searchPatients = async (query: string) =>
  apiClient.get<User[]>("/hospital/patients/search", {
    params: { q: query },
  });

export const assignStaffToPatient = async (linkId: string, staffId: string) =>
  apiClient.patch<Link>(`/hospital/patient/${linkId}/assign-staff`, {
    staffId,
  });

export const getLinkedPatients = async (filter?: string, staffId?: string) =>
  apiClient.get<Link[]>("/hospital/patient", {
    params: { filter, staffId },
  });

export const linkPatient = async (patientId: string) =>
  apiClient.post<Link>(`/hospital/patient/${patientId}`);

export const togglePatientVerification = async (linkId: string) =>
  apiClient.patch<Link>(`/hospital/patient/${linkId}/verify`);

export const createAssignment = async (payload: {
  patientId: string;
  exerciseId: string;
  customReps?: number;
  customHoldSeconds?: number;
  notes?: string;
}) => apiClient.post<Assignment>("/hospital/assignment", payload);

export const getHospitalAssignments = async (patientId?: string) =>
  apiClient.get<Assignment[]>("/hospital/assignment", {
    params: patientId ? { patientId } : undefined,
  });

export const getHospitalAssignmentById = async (id: string) =>
  apiClient.get<Assignment>(`/hospital/assignment/${id}`);

export const updateHospitalAssignment = async (
  id: string,
  payload: Partial<
    Pick<Assignment, "status" | "notes" | "customReps" | "customHoldSeconds">
  >,
) => apiClient.patch<Assignment>(`/hospital/assignment/${id}`, payload);

export const getHospitalSessionResults = async (assignmentId: string) =>
  apiClient.get<SessionResult[]>(
    `/hospital/assignment/${assignmentId}/session-results`,
  );

export const deleteHospitalAssignment = async (id: string) =>
  apiClient.delete<Assignment>(`/hospital/assignment/${id}`);
