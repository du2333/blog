import { cachedData } from "@/lib/cache/cache.data";
import type { Context } from "@/lib/cache/types";
import type { DB } from "@/lib/db";
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
		},
	);
}
