import { useQuery } from "@/hooks/useQuery";
import {
  getAllPatients,
  getAllStaff,
  getHospitalAssignmentById,
  getHospitalAssignments,
  getHospitalSessionResults,
  getLinkedPatients,
  getStaffById,
} from "@/lib/hospital";

export const useHospitalQuery = {
  staff: () =>
    useQuery<User[]>({
      key: "/hospital/staff",
      fetcher: getAllStaff,
    }),

  patients: () =>
    useQuery<Link[]>({
      key: "/hospital/patient",
      fetcher: getAllPatients,
    }),

  assignments: (patientId?: string) =>
    useQuery<Assignment[]>({
      key: "/hospital/assignment",
      fetcher: () => getHospitalAssignments(patientId),
    }),

  assignmentById: (assignmentId: string) =>
    useQuery<Assignment>({
      key: `/hospital/assignment/${assignmentId}`,
      fetcher: () => getHospitalAssignmentById(assignmentId),
    }),

  staffById: (staffId: string) =>
    useQuery<User>({
      key: `/hospital/staff/${staffId}`,
      fetcher: () => getStaffById(staffId),
    }),

  linkedPatients: (staffId?: string) =>
    useQuery<Link[]>({
      key: `/hospital/patients/${staffId ?? ""}`,
      fetcher: () => getLinkedPatients(undefined, staffId),
    }),

  sessionResults: (assignmentId: string) =>
    useQuery({
      key: `/hospital/assignments/${assignmentId}/session-results`,
      fetcher: () => getHospitalSessionResults(assignmentId),
    }),
};
