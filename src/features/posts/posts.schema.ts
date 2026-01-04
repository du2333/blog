import { z } from "zod";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import type { PostCategory, PostStatus } from "@/lib/db/schema";
import { POST_STATUSES, PostsTable } from "@/lib/db/schema";

export const PostSelectSchema = createSelectSchema(PostsTable);
export const PostInsertSchema = createInsertSchema(PostsTable);
export const PostUpdateSchema = createUpdateSchema(PostsTable);

export const PostItemSchema = PostSelectSchema.omit({ contentJson: true });
export const PostListResponseSchema = z.object({
  items: z.array(PostItemSchema),
  nextCursor: z.number().nullable(),
});
export const PostWithTocSchema = PostSelectSchema.extend({
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

// Admin API Schemas
export const GenerateSlugInputSchema = z.object({
  title: z.string().optional(),
  excludeId: z.number().optional(),
});

export const GetPostsInputSchema = z.object({
  offset: z.number().optional(),
  limit: z.number().optional(),
  category: z.custom<PostCategory>().optional(),
  status: z.custom<PostStatus>().optional(),
  publicOnly: z.boolean().optional(),
  search: z.string().optional(),
  sortDir: z.enum(["ASC", "DESC"]).optional(),
});

export const GetPostsCountInputSchema = GetPostsInputSchema.omit({
  offset: true,
  limit: true,
  sortDir: true,
});

export const FindPostByIdInputSchema = z.object({ id: z.number() });

export const UpdatePostInputSchema = z.object({
  id: z.number(),
  data: PostUpdateSchema,
});

export const DeletePostInputSchema = z.object({ id: z.number() });

export const PreviewSummaryInputSchema = PostSelectSchema.pick({
  contentJson: true,
});

export const StartPostProcessInputSchema = z.object({
  id: z.number(),
  status: z.enum(POST_STATUSES),
});

export type GenerateSlugInput = z.infer<typeof GenerateSlugInputSchema>;
export type GetPostsInput = z.infer<typeof GetPostsInputSchema>;
export type GetPostsCountInput = z.infer<typeof GetPostsCountInputSchema>;
export type FindPostByIdInput = z.infer<typeof FindPostByIdInputSchema>;
export type UpdatePostInput = z.infer<typeof UpdatePostInputSchema>;
export type DeletePostInput = z.infer<typeof DeletePostInputSchema>;
export type PreviewSummaryInput = z.infer<typeof PreviewSummaryInputSchema>;
export type StartPostProcessInput = z.infer<typeof StartPostProcessInputSchema>;
