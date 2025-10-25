import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const testTable = sqliteTable("test", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  age: int().notNull(),
});
