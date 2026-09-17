import { useQuery } from "@/hooks/useQuery";
import { getAdminRequestStats, getAdmins, getAdminStats } from "@/lib/admin";

export const useAdminQuery = {
  admins: () =>
    useQuery({
      key: "/admin",
      fetcher: getAdmins,
    }),
  stats: () =>
    useQuery<AdminStats>({
      key: "/admin/stats",
      fetcher: getAdminStats,
    }),

  requestStats: () =>
    useQuery<AdminRequestStats>({
      key: "/admin/stats/requests",
      fetcher: getAdminRequestStats,
    }),
};
