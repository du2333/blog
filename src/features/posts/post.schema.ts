import { z } from "zod";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import type { PostCategory } from "@/lib/db/schema";
import { PostsTable } from "@/lib/db/schema";

export const PostSelectSchema = createSelectSchema(PostsTable);
export const PostInsertSchema = createInsertSchema(PostsTable);
export const PostUpdateSchema = createUpdateSchema(PostsTable);

export const PostItemSchema = PostSelectSchema.omit({ contentJson: true });
export const PostListResponseSchema = z.object({
  items: z.array(PostItemSchema),
  nextCursor: z.number().nullable(),
});
export const PostWithTocSchema = PostItemSchema.extend({
  toc: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
      level: z.number(),
    }),
  ),
}).nullable();

export const GetPostsCursorInputSchema = z.object({
  cursor: z.number().optional(),
  limit: z.number().optional(),
  category: z.custom<PostCategory>().optional(),
});

export const FindPostBySlugInputSchema = z.object({
  slug: z.string(),
});

export type GetPostsCursorInput = z.infer<typeof GetPostsCursorInputSchema>;
export type FindPostBySlugInput = z.infer<typeof FindPostBySlugInputSchema>;
