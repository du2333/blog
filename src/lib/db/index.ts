import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

let db: DB | null = null;

export function getDb(env: Env) {
  if (db) return db;
  db = createDb(env);
  return db;
}
function createDb(env: Env): ReturnType<typeof drizzle<typeof schema>> {
  return drizzle(env.DB, { schema });
}

export type DB = ReturnType<typeof createDb>;
