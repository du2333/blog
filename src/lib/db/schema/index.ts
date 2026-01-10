import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";
import type { AnySQLiteColumn } from "drizzle-orm/sqlite-core";
import type { SystemConfig } from "@/features/config/config.schema";
import type { JSONContent } from "@tiptap/react";
import { user } from "@/lib/db/schema/auth.schema";

export * from "./auth.schema";

export const POST_STATUSES = ["draft", "published", "archived"] as const;
// published: 所有人可见
// verifying: 刚入库，AI 还没跑完 (仅作者可见)
// pending: AI 觉得有风险，等人工 (仅作者/管理员可见)
// deleted: 软删
export const COMMENT_STATUSES = [
  "pending",
  "published",
  "deleted",
  "verifying",
] as const;

export const PostsTable = sqliteTable(
  "posts",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    title: text().notNull(),
    summary: text(),
    readTimeInMinutes: integer("read_time_in_minutes").default(1).notNull(),
    slug: text().notNull().unique(),

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
  ],
);

export const MediaTable = sqliteTable(
  "media",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    key: text().notNull().unique(),
    url: text().notNull(),
    fileName: text("file_name").notNull(),
    width: integer("width"),
    height: integer("height"),
    mimeType: text("mime_type").notNull(),
    sizeInBytes: integer("size_in_bytes").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [index("created_at_idx_media").on(table.createdAt)],
);

export const PostMediaTable = sqliteTable(
  "post_media",
  {
    postId: integer("post_id")
      .notNull()
      .references(() => PostsTable.id, { onDelete: "cascade" }),
    mediaId: integer("media_id")
      .notNull()
      .references(() => MediaTable.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.postId, table.mediaId] })],
);

export const TagsTable = sqliteTable("tags", {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const PostTagsTable = sqliteTable(
  "post_tags",
  {
    postId: integer("post_id")
      .notNull()
      .references(() => PostsTable.id, { onDelete: "cascade" }),
    tagId: integer("tag_id")
      .notNull()
      .references(() => TagsTable.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.postId, table.tagId] }),
    index("post_tags_tag_idx").on(table.tagId),
  ],
);

export const SystemConfigTable = sqliteTable("system_config", {
  id: integer().primaryKey({ autoIncrement: true }),
  configJson: text("config_json", { mode: "json" }).$type<SystemConfig>(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
});

export const postsRelations = relations(PostsTable, ({ many }) => ({
  postTags: many(PostTagsTable),
}));

export const tagsRelations = relations(TagsTable, ({ many }) => ({
  postTags: many(PostTagsTable),
}));

export const postTagsRelations = relations(PostTagsTable, ({ one }) => ({
  post: one(PostsTable, {
    fields: [PostTagsTable.postId],
    references: [PostsTable.id],
  }),
  tag: one(TagsTable, {
    fields: [PostTagsTable.tagId],
    references: [TagsTable.id],
  }),
}));

export const CommentsTable = sqliteTable(
  "comments",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    content: text({ mode: "json" }).$type<JSONContent>(),
    rootId: integer("root_id").references(
      (): AnySQLiteColumn => CommentsTable.id,
      {
        onDelete: "cascade",
      },
    ),
    replyToCommentId: integer("reply_to_comment_id").references(
      (): AnySQLiteColumn => CommentsTable.id,
      { onDelete: "set null" },
    ),
    status: text("status", { enum: COMMENT_STATUSES })
      .notNull()
      .default("verifying"),
    aiReason: text("ai_reason"),

    postId: integer("post_id")
      .notNull()
      .references(() => PostsTable.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "set null" }),

    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`)
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("comments_post_root_created_idx").on(
      table.postId,
      table.rootId,
      table.createdAt,
    ),
    index("comments_user_created_idx").on(table.userId, table.createdAt),
    index("comments_status_created_idx").on(table.status, table.createdAt),
    index("comments_global_created_idx").on(table.createdAt),
  ],
);

export type Tag = typeof TagsTable.$inferSelect;
export type Post = typeof PostsTable.$inferSelect;
export type PostListItem = Omit<Post, "contentJson"> & {
  tags?: Array<Tag>;
};
export type Comment = typeof CommentsTable.$inferSelect;

export type PostStatus = (typeof POST_STATUSES)[number];
export type CommentStatus = (typeof COMMENT_STATUSES)[number];
