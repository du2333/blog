import {
  findPostBySlug,
  getPostsCursor
} from "@/features/posts/data/posts.data";
import {
  PostCategory
} from "@/lib/db/schema";
import { generateTableOfContents } from "@/lib/editor/toc";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const getPostsCursorFn = createServerFn()
  .inputValidator(
    z.object({
      cursor: z.number().optional(),
      limit: z.number().optional(),
      category: z.custom<PostCategory>().optional(),
    })
  )
  .handler(async ({ data, context }) => {
    return await getPostsCursor(context.db, {
      cursor: data.cursor,
      limit: data.limit,
      category: data.category,
      publicOnly: true,
    });
  });

export const findPostBySlugFn = createServerFn()
  .inputValidator(z.object({ slug: z.string() }))
  .handler(async ({ data, context }) => {
    const post = await findPostBySlug(context.db, data.slug, true);
    if (!post) return null;
    return {
      ...post,
      toc: generateTableOfContents(post.contentJson),
    };
  });
