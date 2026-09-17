import { apiClient } from "./apiClient";

export const getActivity = async (params?: {
  unseenOnly?: boolean;
  limit?: number;
  cursor?: string;
}) =>
  apiClient.get<AuditLogEntry[]>("/activity", {
    params: {
      unseenOnly: params?.unseenOnly ? "true" : undefined,
      limit: params?.limit,
      cursor: params?.cursor,
    },
  });

export const getUnseenCount = async () =>
  apiClient.get<{ count: number }>("/activity/unseen-count");

export const markSeen = async (logIds: string[]) =>
  apiClient.patch<{ success: boolean }>("/activity/mark-seen", { logIds });
