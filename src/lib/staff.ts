import { AxiosError } from "axios";
import { api } from "./axios";

export const getStaffPatients = async () => {
  try {
    const res = await api.get("/staff/patients");
    const data: Link[] = res.data;

    return data;
  } catch (e) {
    const err = e as AxiosError<{ message: string }>;
    throw new Error(err.response?.data?.message ?? "Something went wrong");
  }
};

export const getStaffPatient = async (linkId: string) => {
  try {
    const res = await api.get(`/staff/patients/${linkId}`);
    const data: Link = res.data;

    return data;
  } catch (e) {
    const err = e as AxiosError<{ message: string }>;
    throw new Error(err.response?.data?.message ?? "Something went wrong");
  }
};

export const createAssignment = async (payload: {
  patientId: string;
  exerciseId: string;
  customReps?: number;
  customHoldSeconds?: number;
  notes?: string;
}) => {
  try {
    const res = await api.post("/staff/assignment", payload);
    const data: Assignment = res.data;
    return data;
  } catch (e) {
    const err = e as AxiosError<{ message: string }>;
    throw new Error(err.response?.data?.message ?? "Something went wrong");
  }
};

export const getStaffPatientAssignments = async (linkId: string) => {
  try {
    const res = await api.get(`/staff/patients/${linkId}/assignments`);
    const data: Assignment[] = res.data;
    return data;
  } catch (e) {
    const err = e as AxiosError<{ message: string }>;
    throw new Error(err.response?.data?.message ?? "Something went wrong");
  }
};
export const getStaffPatientAssignmentById = async (id: string) => {
  try {
    const res = await api.get(`/staff/assignments/${id}`);
    const data: Assignment = res.data;
    return data;
  } catch (e) {
    const err = e as AxiosError<{ message: string }>;
    throw new Error(err.response?.data?.message ?? "Something went wrong");
  }
};

export const getStaffSessionResults = async (assignmentId: string) => {
  try {
    const res = await api.get(
      `/staff/assignments/${assignmentId}/session-results`,
    );
    const data: SessionResult[] = res.data;
    return data;
  } catch (e) {
    const err = e as AxiosError<{ message: string }>;
    throw new Error(err.response?.data?.message ?? "Something went wrong");
  }
};
