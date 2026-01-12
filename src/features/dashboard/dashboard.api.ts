import { createAdminFn } from "@/lib/middlewares";
import * as DashboardService from "@/features/dashboard/dashboard.service";

export const getDashboardStatsFn = createAdminFn().handler(({ context }) =>
  DashboardService.getDashboardStats(context),
);
