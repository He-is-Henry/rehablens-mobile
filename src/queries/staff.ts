import { useQuery } from "@/hooks/useQuery";
import {
  getStaffAssignmentSchedules,
  getStaffPatientAssignmentById,
  getStaffPatientAssignments,
  getStaffPatients,
  getStaffSessionResults,
} from "@/lib/staff";

export const useStaffQuery = {
  patients: () =>
    useQuery<Link[]>({
      key: "/staff/patients",
      fetcher: getStaffPatients,
    }),

  patientAssignments: (linkId: string) =>
    useQuery({
      key: `/staff/assignments/${linkId}`,
      fetcher: () => getStaffPatientAssignments(linkId),
    }),

  patientAssignmentById: (assignmentId: string) =>
    useQuery({
      key: `/staff/assignments/${assignmentId}`,
      fetcher: () => getStaffPatientAssignmentById(assignmentId),
    }),
  schedules: (assignmentId: string) =>
    useQuery<Schedule[]>({
      key: `/staff/assignment/${assignmentId}/schedules`,
      fetcher: () => getStaffAssignmentSchedules(assignmentId),
      enabled: !!assignmentId,
    }),
  assignmentSessionResults: (assignmentId: string) =>
    useQuery({
      key: `/staff/assignments/${assignmentId}/session-results`,
      fetcher: () => getStaffSessionResults(assignmentId),
    }),
};
