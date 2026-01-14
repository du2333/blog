import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";
import type { DrizzleD1Database } from "drizzle-orm/d1";

export type DB = DrizzleD1Database<typeof schema>;

let db: DB | null = null;

export function getDb(env: Env) {
  if (!db) {
    db = drizzle(env.DB, { schema });
  }
  return db;
}
