import { createServerFn } from "@tanstack/react-start";
import { adminMiddleware } from "@/lib/middlewares";
import * as DashboardService from "@/features/dashboard/dashboard.service";

export const getDashboardStatsFn = createServerFn()
  .middleware([adminMiddleware])
  .handler(({ context }) => DashboardService.getDashboardStats(context));
