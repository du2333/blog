import type { JSONContent } from "@tiptap/react";
import { sql } from "drizzle-orm";
import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

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
      .default(sql`(unixepoch())`)
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("published_at_idx").on(table.publishedAt, table.status),
    index("created_at_idx").on(table.createdAt),
  ]
);

export const MediaTable = sqliteTable(
  "media",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    key: text().notNull().unique(),
    url: text().notNull(),
    fileName: text().notNull(),
    width: integer("width"),
    height: integer("height"),
    mimeType: text("mime_type").notNull(),
    sizeInBytes: integer("size_in_bytes").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [index("created_at_idx_media").on(table.createdAt)]
);

export const PostMediaTable = sqliteTable(
  "post_media",
  {
    postId: integer()
      .notNull()
      .references(() => PostsTable.id, { onDelete: "cascade" }),
    mediaId: integer()
      .notNull()
      .references(() => MediaTable.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.postId, table.mediaId] })]
);

export type Post = typeof PostsTable.$inferSelect;
export type PostCategory = (typeof POST_CATEGORIES)[number];
export type PostStatus = (typeof POST_STATUSES)[number];
