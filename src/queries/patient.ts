import { useQuery } from "@/hooks/useQuery";
import {
  getPatientAssignmentById,
  getPatientAssignments,
  getPatientHospitalById,
  getPatientHospitals,
  getPatientSessionResults,
  getPatientSessionResultsByAssignment,
} from "@/lib/patient";

export const usePatientQuery = {
  hospitals: () =>
    useQuery<Link[]>({
      key: "/patient/hospitals",
      fetcher: getPatientHospitals,
    }),
  hospitalById: (id: string) =>
    useQuery({
      key: `/patient/hospitals/${id}`,
      fetcher: () => getPatientHospitalById(id),
    }),
  assignments: () =>
    useQuery<Assignment[]>({
      key: "/patient/assignments",
      fetcher: getPatientAssignments,
    }),

  assignmentById: (assignmentId: string) =>
    useQuery<Assignment>({
      key: `/patient/assignments/${assignmentId}`,
      fetcher: () => getPatientAssignmentById(assignmentId),
    }),

  sessionResults: (assignmentId: string) =>
    useQuery<SessionResult[]>({
      key: `/patient/session-results/${assignmentId}`,
      fetcher: () => getPatientSessionResultsByAssignment(assignmentId),
    }),

  allSessionResults: () =>
    useQuery<PopulatedSessionResult[]>({
      key: "/patient/session-results/",
      fetcher: getPatientSessionResults,
    }),
};
