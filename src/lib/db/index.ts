import { drizzle } from "drizzle-orm/d1";

export type DB = ReturnType<typeof drizzle>;

export function createDb(env: Env) {
  return drizzle(env.DB);
}
