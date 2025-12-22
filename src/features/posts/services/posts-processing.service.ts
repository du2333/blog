import { eq } from "drizzle-orm";
import { findPostById } from "@/features/posts/data/posts.data";
import { summarizeText } from "@/lib/ai/summarizer";
import type { DB } from "@/lib/db";
import { PostsTable } from "@/lib/db/schema";
import { convertToPlainText } from "@/lib/editor/utils";

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

	try {
		const { summary } = await summarizeText(db, plainText);

		const [updatedPost] = await db
			.update(PostsTable)
			.set({ summary })
			.where(eq(PostsTable.id, post.id))
			.returning();

		return updatedPost;
	} catch (error) {
		// 如果 AI 服务未配置，静默跳过，返回原 post
		if (error instanceof Error && error.message === "AI_NOT_CONFIGURED") {
			return post;
		}
		// 其他错误继续抛出
		throw error;
	}
}
