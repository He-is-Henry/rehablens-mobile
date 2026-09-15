import { apiClient } from "./apiClient";
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

export const login = async (email: string, password: string) =>
  apiClient.post<LoginRes>("auth/login", { email, password });

export const logout = async () => {
  const refreshToken = await token.getRefresh();
  return apiClient.post<GenericRes>("auth/logout", { refreshToken });
};

export const forgotPassword = async (email: string) =>
  apiClient.post<GenericRes>("auth/forgot-password", {
    email,
  });

export const resetPassword = async (payload: {
  email: string;
  token?: string;
  manualCode?: string;
  newPassword: string;
}) => apiClient.post<GenericRes>("auth/reset-password", payload);

export const fetchProfile = async () =>
  apiClient.get<ProfileRes>("auth/profile");

export const revokeSession = async (id: string) =>
  apiClient.delete(`auth/session/${id}`);

export const revokeAllSessions = async () =>
  apiClient.delete("auth/session/all");

export const changeInitialPassword = async (newPassword: string) =>
  apiClient.post<GenericRes>("auth/change-initial-password", { newPassword });

export const changePassword = async (
  currentPassword: string,
  newPassword: string,
) =>
  apiClient.patch<GenericRes>("auth/change-password", {
    currentPassword,
    newPassword,
  });

export const recoverAccount = async (email: string, password: string) =>
  apiClient.post<LoginRes>("auth/recover", { email, password });

export const deleteAccount = async () =>
  apiClient.delete<GenericRes>("auth/delete");
