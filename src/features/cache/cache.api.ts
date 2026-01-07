import { purgeSiteCDNCache } from "@/lib/invalidate";
import { createAdminFn } from "@/lib/middlewares";

export const invalidateCDNCacheFn = createAdminFn().handler(({ context }) =>
  purgeSiteCDNCache(context.env),
);
