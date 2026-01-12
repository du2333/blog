import { queryOptions } from "@tanstack/react-query";
import { getDashboardStatsFn } from "@/features/dashboard/dashboard.api";

export function dashboardStatsQuery() {
  return queryOptions({
    queryKey: ["dashboard", "stats"],
    queryFn: () => getDashboardStatsFn(),
  });
}
