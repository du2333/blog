import type { SortDirection } from "@/features/posts/data/helper";
import type { DB } from "@/lib/db";
import type { PostCategory, PostListItem, PostStatus } from "@/lib/db/schema";
import { and, count, desc, eq, lt, ne } from "drizzle-orm";
import {
	buildPostOrderByClause,
	buildPostWhereClause,

} from "@/features/posts/data/helper";
import {

	PostsTable,
} from "@/lib/db/schema";

const DEFAULT_PAGE_SIZE = 12;

export async function insertPost(db: DB, data: typeof PostsTable.$inferInsert) {
	const [post] = await db.insert(PostsTable).values(data).returning();
	return post;
}

export async function getPosts(
	db: DB,
	options: {
		offset?: number;
		limit?: number;
		category?: PostCategory;
		status?: PostStatus;
		publicOnly?: boolean;
		search?: string;
		sortDir?: SortDirection;
	} = {},
) {
	const {
		offset = 0,
		limit = DEFAULT_PAGE_SIZE,
		sortDir,
		...filters
	} = options;
	const whereClause = buildPostWhereClause(filters);
	const orderByClause = buildPostOrderByClause(sortDir);

	const posts = await db
		.select({
			id: PostsTable.id,
			title: PostsTable.title,
			summary: PostsTable.summary,
			readTimeInMinutes: PostsTable.readTimeInMinutes,
			slug: PostsTable.slug,
			category: PostsTable.category,
			status: PostsTable.status,
			publishedAt: PostsTable.publishedAt,
			createdAt: PostsTable.createdAt,
			updatedAt: PostsTable.updatedAt,
		})
		.from(PostsTable)
		.limit(Math.min(limit, 50))
		.offset(offset)
		.orderBy(orderByClause)
		.where(whereClause);
	return posts;
}

export async function getPostsCount(
	db: DB,
	options: {
		category?: PostCategory;
		status?: PostStatus;
		publicOnly?: boolean;
		search?: string;
	} = {},
) {
	const whereClause = buildPostWhereClause(options);
	const totalNumberofPosts = await db
		.select({ count: count() })
		.from(PostsTable)
		.where(whereClause);
	return totalNumberofPosts[0].count;
}

/**
 * Get posts with cursor-based pagination
 * @param cursor - The id of the last item from previous page
 * @param limit - Number of items per page
 */
export async function getPostsCursor(
	db: DB,
	options: {
		cursor?: number;
		limit?: number;
		category?: PostCategory;
		publicOnly?: boolean;
	} = {},
): Promise<{
	items: PostListItem[];
	nextCursor: number | null;
}> {
	const { cursor, limit = DEFAULT_PAGE_SIZE, category, publicOnly } = options;

	// Build base conditions from helper
	const baseConditions = buildPostWhereClause({ category, publicOnly });

	// Add cursor condition if provided
	const conditions = [];
	if (baseConditions) {
		conditions.push(baseConditions);
	}
	if (cursor) {
		conditions.push(lt(PostsTable.id, cursor));
	}

	const items = await db
		.select({
			id: PostsTable.id,
			title: PostsTable.title,
			summary: PostsTable.summary,
			readTimeInMinutes: PostsTable.readTimeInMinutes,
			slug: PostsTable.slug,
			category: PostsTable.category,
			status: PostsTable.status,
			publishedAt: PostsTable.publishedAt,
			createdAt: PostsTable.createdAt,
			updatedAt: PostsTable.updatedAt,
		})
		.from(PostsTable)
		.where(conditions.length > 0 ? and(...conditions) : undefined)
		.orderBy(desc(PostsTable.id))
		.limit(limit + 1);

	// Check if there's a next page
	const hasMore = items.length > limit;
	if (hasMore) {
		items.pop();
	}

	const nextCursor = hasMore ? (items[items.length - 1]?.id ?? null) : null;

	return { items, nextCursor };
}

export async function findPostById(db: DB, id: number) {
	return await db.query.PostsTable.findFirst({ where: eq(PostsTable.id, id) });
}

export async function findPostBySlug(
	db: DB,
	slug: string,
	options: { publicOnly?: boolean } = {},
) {
	const { publicOnly = false } = options;

	const whereClause = buildPostWhereClause({ publicOnly });
	return await db.query.PostsTable.findFirst({
		where: and(eq(PostsTable.slug, slug), whereClause),
	});
}

export async function updatePost(
	db: DB,
	id: number,
	data: Partial<Omit<typeof PostsTable.$inferInsert, "id" | "createdAt">>,
) {
	const [post] = await db
		.update(PostsTable)
		.set(data)
		.where(eq(PostsTable.id, id))
		.returning();
	return post;
}

export async function deletePost(db: DB, id: number) {
	await db.delete(PostsTable).where(eq(PostsTable.id, id));
}

/**
 * Check if a slug exists in the database
 * @param slug - The slug to check
 * @param excludeId - Optional post ID to exclude (for editing existing posts)
 */
export async function slugExists(
	db: DB,
	slug: string,
	options: { excludeId?: number } = {},
): Promise<boolean> {
	const { excludeId } = options;
	const conditions = [eq(PostsTable.slug, slug)];
	if (excludeId) {
		conditions.push(ne(PostsTable.id, excludeId));
	}
	const results = await db
		.select({ id: PostsTable.id })
		.from(PostsTable)
		.where(and(...conditions))
		.limit(1);
	return results.length > 0;
}
