import { AxiosError } from "axios";
import { api } from "./axios";
import token from "./token";

interface ProfileRes {
  user: User;
  sessions: Session[];
}

interface LoginRes {
  accessToken: string;
  refreshToken: string;
  user: User;
  session: Session;
}

interface GenericRes {
  message: string;
}

export const login = async (email: string, password: string) => {
  try {
    const res = await api.post("auth/login", {
      email,
      password,
    });
    const data: LoginRes = res.data;
    return data;
  } catch (e) {
    const err = e as AxiosError<{ message: string }>;
    throw new Error(err.response?.data?.message ?? "Something went wrong");
  }
};

export const logout = async () => {
  const refreshToken = await token.getRefresh();
  const res = await api.post("auth/logout", { refreshToken });
  const data: GenericRes = res.data;

  return data;
};

export const forgotPassword = async (email: string) => {
  try {
    const res = await api.post("auth/forgot-password", {
      email,
    });
    const data: GenericRes = res.data;
    return data;
  } catch (e) {
    const err = e as AxiosError<{ message: string }>;
    throw new Error(err.response?.data?.message ?? "Something went wrong");
  }
};

export const resetPassword = async (payload: {
  email: string;
  token?: string;
  manualCode?: string;
  newPassword: string;
}) => {
  try {
    const res = await api.post("auth/reset-password", payload);
    const data: GenericRes = res.data;
    return data;
  } catch (e) {
    const err = e as AxiosError<{ message: string }>;
    throw new Error(err.response?.data?.message ?? "Something went wrong");
  }
};

export const fetchProfile = async () => {
  try {
    const res = await api.get("auth/profile");
    const data: ProfileRes = res.data;

    return data;
  } catch (e) {
    const err = e as AxiosError<{ message: string }>;
    throw new Error(err.response?.data?.message ?? "Something went wrong");
  }
};

export const revokeSession = async (id: string) => {
  try {
    const res = await api.delete(`auth/session/${id}`);
    return res.data;
  } catch (e) {
    const err = e as AxiosError<{ message: string }>;
    throw new Error(err.response?.data?.message ?? "Something went wrong");
  }
};

export const revokeAllSessions = async () => {
  try {
    const res = await api.delete("auth/session/all");
    return res.data;
  } catch (e) {
    const err = e as AxiosError<{ message: string }>;
    throw new Error(err.response?.data?.message ?? "Something went wrong");
  }
};

export const changeInitialPassword = async (newPassword: string) => {
  try {
    const res = await api.post("auth/change-initial-password", { newPassword });
    const data: GenericRes = res.data;
    return data;
  } catch (e) {
    const err = e as AxiosError<{ message: string }>;
    throw new Error(err.response?.data?.message ?? "Something went wrong");
  }
};

export const changePassword = async (
  currentPassword: string,
  newPassword: string,
) => {
  try {
    const res = await api.patch("auth/change-password", {
      currentPassword,
      newPassword,
    });
    const data: GenericRes = res.data;
    return data;
  } catch (e) {
    const err = e as AxiosError<{ message: string }>;
    throw new Error(err.response?.data?.message ?? "Something went wrong");
  }
};
