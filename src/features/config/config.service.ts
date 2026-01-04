import { getSystemConfig } from "./config.data";
import { SystemConfigSchema } from "./config.schema";
import type { Context } from "@/features/cache/types";
import type { DB } from "@/lib/db";
import * as CacheService from "@/features/cache/cache.service";

export async function getCachedSystemConfig({
  db,
  context,
}: {
  db: DB;
  context: Context;
}) {
  return await CacheService.get(
    context,
    ["system"],
    SystemConfigSchema.nullable(),
    async () => {
      return await getSystemConfig(db);
    },
  );
}
