import {
  buildPostWhereClause,
  uniqueOrThrow,
} from "@/features/posts/data/helper";
import { type DB } from "@/lib/db";
import { PostCategory, PostStatus, PostsTable } from "@/lib/db/schema";
import { and, count, desc, eq, lte, ne } from "drizzle-orm";

export async function insertPost(db: DB, data: typeof PostsTable.$inferInsert) {
  const [post] = await db.insert(PostsTable).values(data).returning();
  return post;
}

export async function getPosts(
  db: DB,
  options: {
    offset: number;
    limit: number;
    category?: PostCategory;
    status?: PostStatus;
    publicOnly?: boolean;
  }
) {
  const whereClause = buildPostWhereClause(options);

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
    .limit(Math.min(options.limit, 50))
    .offset(options.offset)
    .orderBy(desc(PostsTable.publishedAt))
    .where(whereClause);
  return posts;
}

export async function getPostsCount(
  db: DB,
  options: {
    category?: PostCategory;
    status?: PostStatus;
    publicOnly?: boolean;
  }
) {
  const whereClause = buildPostWhereClause(options);
  const totalNumberofPosts = await db
    .select({ count: count() })
    .from(PostsTable)
    .where(whereClause);
  return totalNumberofPosts[0].count;
}

export async function findPostById(db: DB, id: number) {
  const results = await db
    .select()
    .from(PostsTable)
    .where(eq(PostsTable.id, id));
  return uniqueOrThrow(results);
}

export async function findPostBySlug(db: DB, slug: string) {
  const results = await db
    .select()
    .from(PostsTable)
    .where(eq(PostsTable.slug, slug));
  return uniqueOrThrow(results);
}

/**
 * Find post by slug for public access
 * Only returns if status=published AND publishedAt <= now
 */
export async function findPostBySlugPublic(db: DB, slug: string) {
  const results = await db
    .select()
    .from(PostsTable)
    .where(
      and(
        eq(PostsTable.slug, slug),
        eq(PostsTable.status, "published"),
        lte(PostsTable.publishedAt, new Date())
      )
    );
  return uniqueOrThrow(results);
}

export async function updatePost(
  db: DB,
  id: number,
  data: Partial<typeof PostsTable.$inferInsert>
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
  excludeId?: number
): Promise<boolean> {
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
