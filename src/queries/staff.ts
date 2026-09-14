import { useQuery } from "@/hooks/useQuery";
import {
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

  assignmentSessionResults: (assignmentId: string) =>
    useQuery({
      key: `/staff/assignments/${assignmentId}/session-results`,
      fetcher: () => getStaffSessionResults(assignmentId),
    }),
};
