import { queryOptions } from "@tanstack/react-query";
import type { DashboardQuery } from "@/features/dashboard/dashboard.schema";
import {
  getDashboardStatsFn,
  refreshDashboardCacheFn,
} from "@/features/dashboard/dashboard.api";

export { refreshDashboardCacheFn };

export function dashboardStatsQuery(query: DashboardQuery = { range: "24h" }) {
  return queryOptions({
    queryKey: ["dashboard", "stats", query.range],
    queryFn: () => getDashboardStatsFn({ data: query }),
  });
}
