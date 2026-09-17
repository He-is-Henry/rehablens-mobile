import { useQuery } from "@/hooks/useQuery";
import { getActivity, getUnseenCount } from "@/lib/audit";

export const useAuditQuery = {
  unseenActivity: () =>
    useQuery<AuditLogEntry[]>({
      key: "/activity?unseenOnly=true",
      fetcher: () => getActivity({ unseenOnly: true, limit: 20 }),
    }),

  unseenCount: () =>
    useQuery<{ count: number }>({
      key: "/activity/unseen-count",
      fetcher: getUnseenCount,
    }),
};
