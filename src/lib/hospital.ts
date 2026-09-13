import { UserRole } from "@/types/role";
import { AxiosError } from "axios";
import { api } from "./axios";

export const getAllStaff = async () => {
  try {
    const res = await api.get("/hospital/staff");
    const data: User[] = res.data;

    return data;
  } catch (e) {
    const err = e as AxiosError<{ message: string }>;
    throw new Error(err.response?.data?.message ?? "Something went wrong");
  }
};

export const getAllPatients = async () => {
  try {
    const res = await api.get("/hospital/patient");
    const data: Link[] = res.data;

    return data;
  } catch (e) {
    const err = e as AxiosError<{ message: string }>;
    throw new Error(err.response?.data?.message ?? "Something went wrong");
  }
};

export const getPatientByLinkId = async (linkId: string) => {
  try {
    const res = await api.get(`/hospital/patient/${linkId}`);
    const data: Link = res.data;

    return data;
  } catch (e) {
    const err = e as AxiosError<{ message: string }>;
    throw new Error(err.response?.data?.message ?? "Something went wrong");
  }
};

export const searchHospitals = async (q: string) => {
  try {
    const res = await api.get(`/hospital/search?q=${q}`);
    const searchResults: Hospital[] = res.data;

    return searchResults;
  } catch (e) {
    const err = e as AxiosError<{ message: string }>;
    throw new Error(err.response?.data?.message ?? "Something went wrong");
  }
};

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
}) => {
  try {
    const res = await api.post("/hospital/register", data);

    console.log(res.data);
    return res.data;
  } catch (e) {
    const err = e as AxiosError<{ message: string }>;
    throw new Error(err.response?.data?.message ?? "Something went wrong");
  }
};

export const createStaff = async (data: {
  name: string;
  email: string;
  role: UserRole;
}) => {
  try {
    const res = await api.post("/hospital/staff", data);
    console.log(res.data);
    return res.data;
  } catch (e) {
    const err = e as AxiosError<{ message: string }>;
    throw new Error(err.response?.data?.message ?? "Something went wrong");
  }
};

export const getStaffById = async (id: string) => {
  try {
    const res = await api.get(`/hospital/staff/${id}`);
    const data: User = res.data;
    return data;
  } catch (e) {
    const err = e as AxiosError<{ message: string }>;
    throw new Error(err.response?.data?.message ?? "Something went wrong");
  }
};

export const updateStaff = async (
  id: string,
  payload: Partial<
    Pick<User, "name" | "email" | "role" | "isActive" | "isPioneer">
  >,
) => {
  try {
    const res = await api.patch(`/hospital/staff/${id}`, payload);
    const data: User = res.data;
    return data;
  } catch (e) {
    const err = e as AxiosError<{ message: string }>;
    throw new Error(err.response?.data?.message ?? "Something went wrong");
  }
};

export const searchPatients = async (query: string) => {
  try {
    const res = await api.get("/hospital/patients/search", {
      params: { q: query },
    });
    const data: User[] = res.data;
    return data;
  } catch (e) {
    const err = e as AxiosError<{ message: string }>;
    throw new Error(err.response?.data?.message ?? "Something went wrong");
  }
};

export const assignStaffToPatient = async (linkId: string, staffId: string) => {
  try {
    const res = await api.patch(`/hospital/patient/${linkId}/assign-staff`, {
      staffId,
    });
    const data: Link = res.data;
    return data;
  } catch (e) {
    const err = e as AxiosError<{ message: string }>;
    throw new Error(err.response?.data?.message ?? "Something went wrong");
  }
};

export const getLinkedPatients = async (filter?: string, staffId?: string) => {
  try {
    const res = await api.get("/hospital/patient", {
      params: { filter, staffId },
    });
    const data: Link[] = res.data;
    return data;
  } catch (e) {
    const err = e as AxiosError<{ message: string }>;
    throw new Error(err.response?.data?.message ?? "Something went wrong");
  }
};

export const linkPatient = async (patientId: string) => {
  try {
    const res = await api.post(`/hospital/patient/${patientId}`);
    const data: Link = res.data;

    return data;
  } catch (e) {
    const err = e as AxiosError<{ message: string }>;
    throw new Error(err.response?.data?.message ?? "Something went wrong");
  }
};

export const togglePatientVerification = async (linkId: string) => {
  try {
    const res = await api.patch(`/hospital/patient/${linkId}/verify`);
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
    const res = await api.post("/hospital/assignment", payload);
    const data: Assignment = res.data;
    return data;
  } catch (e) {
    const err = e as AxiosError<{ message: string }>;
    throw new Error(err.response?.data?.message ?? "Something went wrong");
  }
};

export const getHospitalAssignments = async (patientId?: string) => {
  try {
    const res = await api.get("/hospital/assignment", {
      params: patientId ? { patientId } : undefined,
    });
    const data: Assignment[] = res.data;
    return data;
  } catch (e) {
    const err = e as AxiosError<{ message: string }>;
    throw new Error(err.response?.data?.message ?? "Something went wrong");
  }
};

export const getHospitalAssignmentById = async (id: string) => {
  try {
    const res = await api.get(`/hospital/assignment/${id}`);
    const data: Assignment = res.data;
    return data;
  } catch (e) {
    const err = e as AxiosError<{ message: string }>;
    throw new Error(err.response?.data?.message ?? "Something went wrong");
  }
};

export const updateAssignment = async (
  id: string,
  payload: Partial<
    Pick<Assignment, "status" | "notes" | "customReps" | "customHoldSeconds">
  >,
) => {
  try {
    const res = await api.patch(`/hospital/assignment/${id}`, payload);
    const data: Assignment = res.data;
    return data;
  } catch (e) {
    const err = e as AxiosError<{ message: string }>;
    throw new Error(err.response?.data?.message ?? "Something went wrong");
  }
};

export const getHospitalSessionResults = async (assignmentId: string) => {
  try {
    const res = await api.get(
      `/hospital/assignment/${assignmentId}/session-results`,
    );
    const data: SessionResult[] = res.data;
    return data;
  } catch (e) {
    const err = e as AxiosError<{ message: string }>;
    throw new Error(err.response?.data?.message ?? "Something went wrong");
  }
};
