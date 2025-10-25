import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const PostsTable = sqliteTable(
  "posts",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    title: text().notNull(),
    slug: text().notNull(),
    // contentJson: text("content_json", { mode: "json" })
    //   .$type<Record<string, any>>()
    //   .notNull(),
    contentHtml: text().notNull(),
    status: text("status", { enum: ["draft", "published", "archived"] })
      .notNull()
      .default("draft"),
    publishedAt: integer("published_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" }).default(
      sql`(unixepoch())`
    ),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`)
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("slug_idx").on(table.slug),
    index("published_at_idx").on(table.publishedAt, table.status),
  ]
);
