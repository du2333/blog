import { queryOptions } from "@tanstack/react-query";
import { getDashboardStatsFn, refreshDashboardCacheFn } from "../dashboard.api";
import type { DashboardQuery } from "../dashboard.schema";

export { refreshDashboardCacheFn };

export const DASHBOARD_KEYS = {
  all: ["dashboard"] as const,

  // Parent keys (static arrays for prefix invalidation)
  stats: ["dashboard", "stats"] as const,

  // Child keys (functions for specific queries)
  statsByRange: (range: string) => ["dashboard", "stats", range] as const,
};

export function dashboardStatsQuery(query: DashboardQuery = { range: "24h" }) {
  return queryOptions({
    queryKey: DASHBOARD_KEYS.statsByRange(query.range),
    queryFn: () => getDashboardStatsFn({ data: query }),
  });
}
