import { AxiosError } from "axios";
import { api } from "./axios";

export const registerPatient = async (data: {
  name: string;
  email: string;
  password: string;
  hospitalId: string;
}) => {
  try {
    const res = await api.post("/patient/signup", data);
    console.log(res.data);
    return res.data;
  } catch (e) {
    const err = e as AxiosError<{ message: string }>;
    throw new Error(err.response?.data?.message ?? "Something went wrong");
  }
};

export const getPatientHospitals = async () => {
  try {
    const res = await api.get("/patient/hospitals");
    const data: Link[] = res.data;

    return data;
  } catch (e) {
    const err = e as AxiosError<{ message: string }>;
    throw new Error(err.response?.data?.message ?? "Something went wrong");
  }
};

export const getPatientHospitalById = async (linkId: string) => {
  try {
    console.log(linkId);
    const res = await api.get(`/patient/hospitals/${linkId}`);
    const data: Link = res.data;

    return data;
  } catch (e) {
    const err = e as AxiosError<{ message: string }>;
    throw new Error(err.response?.data?.message ?? "Something went wrong");
  }
};

export const getPatientAssignments = async (
  hospitalId?: string,
  status?: AssignmentStatus,
) => {
  try {
    const res = await api.get(
      `/patient/assignments?hospitalId=${hospitalId}&status=${status}`,
    );
    const data: Assignment[] = res.data;
    return data;
  } catch (e) {
    const err = e as AxiosError<{ message: string }>;
    throw new Error(err.response?.data?.message ?? "Something went wrong");
  }
};

export const getPatientAssignmentById = async (id: string) => {
  try {
    const res = await api.get(`/patient/assignments/${id}`);
    const data: Assignment = res.data;
    return data;
  } catch (e) {
    const err = e as AxiosError<{ message: string }>;
    throw new Error(err.response?.data?.message ?? "Something went wrong");
  }
};

export const createSessionResult = async (payload: {
  assignmentId: string;
  repsCompleted: number;
  targetReps: number;
  durationSeconds: number;
  status: "completed" | "abandoned";
}) => {
  try {
    const res = await api.post("/patient/session-results", payload);
    const data: SessionResult = res.data;
    return data;
  } catch (e) {
    const err = e as AxiosError<{ message: string }>;
    throw new Error(err.response?.data?.message ?? "Something went wrong");
  }
};

export const getPatientSessionResults = async () => {
  try {
    const res = await api.get("/patient/session-results");
    const data: PopulatedSessionResult[] = res.data;
    return data;
  } catch (e) {
    const err = e as AxiosError<{ message: string }>;
    throw new Error(err.response?.data?.message ?? "Something went wrong");
  }
};

export const getPatientSessionResultsByAssignment = async (
  assignmentId: string,
) => {
  try {
    const res = await api.get(`/patient/session-results/${assignmentId}`);
    const data: SessionResult[] = res.data;
    return data;
  } catch (e) {
    const err = e as AxiosError<{ message: string }>;
    throw new Error(err.response?.data?.message ?? "Something went wrong");
  }
};

export const requestHospitalLink = async (hospitalId: string) => {
  try {
    const res = await api.post(`/patient/hospitals/${hospitalId}`);
    const data: Link = res.data;
    return data;
  } catch (e) {
    const err = e as AxiosError<{ message: string }>;
    throw new Error(err.response?.data?.message ?? "Something went wrong");
  }
};
