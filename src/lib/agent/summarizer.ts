import { findPostById } from "@/features/posts/data/posts.data";
import type { DB } from "@/lib/db";
import { PostsTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function generateSummaryByPostId(db: DB, postId: number) {
  const post = await findPostById(db, postId);

  if (!post) {
    throw new Error("Post not found");
  }

  // 如果已经存在摘要，则直接返回
  if (post.summary && post.summary.trim().length > 0) return post;

  // TODO: AI 摘要生成
  const summary = post.summary;

  const [updatedPost] = await db
    .update(PostsTable)
    .set({ summary })
    .where(eq(PostsTable.id, post.id))
    .returning();

  return updatedPost;
}
