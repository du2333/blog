import { createServerFn } from "@tanstack/react-start";
import { adminMiddleware } from "@/lib/middlewares";
import * as DashboardService from "@/features/dashboard/dashboard.service";
import * as CacheService from "@/features/cache/cache.service";
import {
  DASHBOARD_CACHE_KEYS,
  DashboardQuerySchema,
} from "@/features/dashboard/dashboard.schema";

export const getDashboardStatsFn = createServerFn()
  .middleware([adminMiddleware])
  .inputValidator(DashboardQuerySchema)
  .handler(({ context, data }) =>
    DashboardService.getDashboardStats(context, data),
  );

export const refreshDashboardCacheFn = createServerFn()
  .middleware([adminMiddleware])
  .inputValidator(DashboardQuerySchema)
  .handler(async ({ context, data }) => {
    // Delete the KV cache for this specific range
    await CacheService.deleteKey(
      context,
      DASHBOARD_CACHE_KEYS.umamiStats(data.range),
    );
    // Refetch fresh data
    return DashboardService.getDashboardStats(context, data);
  });
