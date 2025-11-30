import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import type { JSONContent } from "@tiptap/react";

export const POST_CATEGORIES = ["DEV", "LIFE", "GAMING", "TECH"] as const;
export const POST_STATUSES = ["draft", "published", "archived"] as const;

export const PostsTable = sqliteTable(
  "posts",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    title: text().notNull(),
    summary: text(),
    readTimeInMinutes: integer().default(1).notNull(),
    slug: text().notNull().unique(),
    category: text("category", { enum: POST_CATEGORIES })
      .default("DEV")
      .notNull(),
    contentJson: text("content_json", { mode: "json" }).$type<JSONContent>(),
    status: text("status", { enum: POST_STATUSES }).notNull().default("draft"),
    publishedAt: integer("published_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [
    index("published_at_idx").on(table.publishedAt, table.status),
    index("created_at_idx").on(table.createdAt),
  ]
);

export type Post = typeof PostsTable.$inferSelect;
export type PostCategory = (typeof POST_CATEGORIES)[number];
export type PostStatus = (typeof POST_STATUSES)[number];
