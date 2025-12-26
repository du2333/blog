import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

let db: DB | null = null;

export function getDb(d1: D1Database) {
	if (db) return db;
	db = createDb(d1);
	return db;
}
function createDb(d1: D1Database): ReturnType<typeof drizzle<typeof schema>> {
	return drizzle(d1, { schema });
}

export type DB = ReturnType<typeof createDb>;
