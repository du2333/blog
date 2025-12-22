import { insert } from "@orama/orama";
import { and, eq, lte } from "drizzle-orm";
import type { DB } from "@/lib/db";
import { PostsTable } from "@/lib/db/schema";
import { convertToPlainText } from "@/lib/editor/utils";
import { persistOramaDb, setOramaDb } from "@/lib/search/loader";
import { createMyDb } from "@/lib/search/schema";

const CONTENT_SLICE = 10000;
const SNIPPET_SLICE = 200;

export async function backfillSearchIndex(env: Env, db: DB) {
	const start = Date.now();
	console.log("[search] Start backfilling index...");

	const searchDb = await createMyDb();

	const posts = await db
		.select({
			id: PostsTable.id,
			slug: PostsTable.slug,
			title: PostsTable.title,
			summary: PostsTable.summary,
			category: PostsTable.category,
			contentJson: PostsTable.contentJson,
			status: PostsTable.status,
			publishedAt: PostsTable.publishedAt,
		})
		.from(PostsTable)
		.where(
			and(
				eq(PostsTable.status, "published"),
				lte(PostsTable.publishedAt, new Date()),
			),
		);

	for (const post of posts) {
		if (!post.title || !post.slug) continue;
		const plain = convertToPlainText(post.contentJson);
		const content =
			plain.length > CONTENT_SLICE ? plain.slice(0, CONTENT_SLICE) : plain;
		const summary =
			post.summary && post.summary.trim().length > 0
				? post.summary
				: content.slice(0, SNIPPET_SLICE);

		await insert(searchDb, {
			id: post.id.toString(),
			title: post.title,
			slug: post.slug,
			category: post.category,
			summary,
			content,
		});
	}

	setOramaDb(searchDb);
	await persistOramaDb(env, searchDb);

	const duration = Date.now() - start;
	console.log(`[search] Indexed ${posts.length} posts in ${duration}ms`);

	return { indexed: posts.length, duration };
}
