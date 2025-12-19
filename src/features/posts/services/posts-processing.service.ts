import { findPostById } from "@/features/posts/data/posts.data";
import { summarizeText } from "@/lib/ai/summarizer";
import { type DB } from "@/lib/db";
import { PostsTable } from "@/lib/db/schema";
import { convertToPlainText } from "@/lib/editor/utils";
import { eq } from "drizzle-orm";

export async function generateSummaryByPostId({
  db,
  postId,
}: {
  db: DB;
  postId: number;
}) {
  const post = await findPostById(db, postId);

  if (!post) {
    throw new Error("Post not found");
  }

  // 如果已经存在摘要，则直接返回
  if (post.summary && post.summary.trim().length > 0) return post;

  const plainText = convertToPlainText(post.contentJson);
  if (plainText.length < 100) {
    return post;
  }

  const { summary } = await summarizeText({ text: plainText });

  const [updatedPost] = await db
    .update(PostsTable)
    .set({ summary })
    .where(eq(PostsTable.id, post.id))
    .returning();

  return updatedPost;
}
