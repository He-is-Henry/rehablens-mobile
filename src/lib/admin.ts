import { apiClient } from "./apiClient";

export const getAdmins = async () => apiClient.get<User[]>("/admin");
export const getAdminStats = async () =>
  apiClient.get<AdminStats>("/admin/stats");

export const createAdmin = async (dto: { name: string; email: string }) =>
  apiClient.post<User>("/admin", dto);

export const getAdminRequestStats = async () =>
  apiClient.get<AdminRequestStats>("/admin/stats/requests");

export const getAdminTimeseries = async (
  metric: "registrations" | "sessions" | "errors",
  days = 30,
) =>
  apiClient.get<DayCount[]>("/admin/stats/timeseries", {
    params: { metric, days },
  });
