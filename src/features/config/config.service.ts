import type { SystemConfig } from "@/features/config/config.schema";
import * as CacheService from "@/features/cache/cache.service";
import * as ConfigRepo from "@/features/config/config.data";
import { SystemConfigSchema } from "@/features/config/config.schema";

export async function getSystemConfig(context: DbContext & { executionCtx: ExecutionContext }) {
  return await CacheService.get(
    context,
    ["system"],
    SystemConfigSchema.nullable(),
    async () => await ConfigRepo.getSystemConfig(context.db),
  );
}

export async function updateSystemConfig(context: DbContext, data: SystemConfig) {
  await ConfigRepo.upsertSystemConfig(context.db, data);
  await CacheService.deleteKey(context, ["system"], ["isEmailConfigured"]);

  return { success: true };
}
