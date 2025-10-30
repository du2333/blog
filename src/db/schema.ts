import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import type { JSONContent } from "@tiptap/react";

export const PostsTable = sqliteTable(
  "posts",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    title: text().notNull(),
    slug: text().notNull(),
    contentJson: text("content_json", { mode: "json" }).$type<JSONContent>(),
    publishedContentJson: text("published_content_json", {
      mode: "json",
    }).$type<JSONContent>(),
    status: text("status", { enum: ["draft", "published", "archived"] })
      .notNull()
      .default("draft"),
    publishedAt: integer("published_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" }).default(
      sql`(unixepoch())`
    ),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [
    index("slug_idx").on(table.slug),
    index("published_at_idx").on(table.publishedAt, table.status),
  ]
);
