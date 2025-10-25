import { drizzle } from "drizzle-orm/d1";

let db: ReturnType<typeof drizzle>;

export function initDb(binding: D1Database) {
  db = drizzle(binding);
}

export function getDb() {
  if (!db) {
    throw new Error("DB not initialized");
  }
  return db;
}
