import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { createdAt, id, updatedAt } from "./helper";
import type { AnySQLiteColumn } from "drizzle-orm/sqlite-core";
import type { SystemConfig } from "@/features/config/config.schema";
import type { JSONContent } from "@tiptap/react";
import { user } from "@/lib/db/schema/auth.schema";

export * from "./auth.schema";

export const POST_STATUSES = ["draft", "published"] as const;
export const COMMENT_STATUSES = [
  "pending",
  "published",
  "deleted",
  "verifying",
] as const;

export const PostsTable = sqliteTable(
  "posts",
  {
    id,
    title: text().notNull(),
    summary: text(),
    readTimeInMinutes: integer("read_time_in_minutes").default(1).notNull(),
    slug: text().notNull().unique(),

    contentJson: text("content_json", { mode: "json" }).$type<JSONContent>(),
    status: text("status", { enum: POST_STATUSES }).notNull().default("draft"),
    publishedAt: integer("published_at", { mode: "timestamp" }),
    createdAt,
    updatedAt,
  },
  (table) => [
    index("published_at_idx").on(table.publishedAt, table.status),
    index("created_at_idx").on(table.createdAt),
  ],
);

export const MediaTable = sqliteTable(
  "media",
  {
    id,
    key: text().notNull().unique(),
    url: text().notNull(),
    fileName: text("file_name").notNull(),
    width: integer("width"),
    height: integer("height"),
    mimeType: text("mime_type").notNull(),
    sizeInBytes: integer("size_in_bytes").notNull(),
    createdAt,
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
  id,
  name: text().notNull().unique(),
  createdAt,
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
  id,
  configJson: text("config_json", { mode: "json" }).$type<SystemConfig>(),
  updatedAt,
});

export const CommentsTable = sqliteTable(
  "comments",
  {
    id,
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

    createdAt,
    updatedAt,
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

export const EMAIL_UNSUBSCRIBE_TYPES = ["reply_notification"] as const;

export const EmailUnsubscriptionsTable = sqliteTable(
  "email_unsubscriptions",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    type: text("type", { enum: EMAIL_UNSUBSCRIBE_TYPES }).notNull(),
    createdAt,
  },
  (table) => [primaryKey({ columns: [table.userId, table.type] })],
);

// ==================== relations ====================
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

// ==================== types ====================
export type Tag = typeof TagsTable.$inferSelect;
export type Post = typeof PostsTable.$inferSelect;

export type Comment = typeof CommentsTable.$inferSelect;
export type EmailUnsubscription = typeof EmailUnsubscriptionsTable.$inferSelect;
export type EmailUnsubscribeType = (typeof EMAIL_UNSUBSCRIBE_TYPES)[number];

export type PostStatus = (typeof POST_STATUSES)[number];
export type CommentStatus = (typeof COMMENT_STATUSES)[number];
