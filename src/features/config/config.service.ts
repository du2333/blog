import { cachedData } from "@/lib/cache/cache.data";
import { Context } from "@/lib/cache/types";
import { DB } from "@/lib/db";
import { getSystemConfig } from "./config.data";
import { SystemConfigSchema } from "./config.schema";

export async function getCachedSystemConfig({
  db,
  context,
}: {
  db: DB;
  context: Context;
}) {
  return await cachedData(
    context,
    ["system"],
    SystemConfigSchema.nullable(),
    async () => {
      return await getSystemConfig(db);
    }
  );
}
