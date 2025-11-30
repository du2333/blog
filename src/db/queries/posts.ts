import { getDb } from "@/db";
import { buildPostWhereClause, uniqueOrThrow } from "@/db/queries/helper";
import { PostCategory, PostStatus, PostsTable } from "@/db/schema";
import { and, count, desc, eq, lte } from "drizzle-orm";

export async function insertPost(data: typeof PostsTable.$inferInsert) {
  const db = getDb();
  await db.insert(PostsTable).values(data);
}

export async function getPosts(options: {
  offset: number;
  limit: number;
  category?: PostCategory;
  status?: PostStatus;
  publicOnly?: boolean;
}) {
  const whereClause = buildPostWhereClause(options);

  const db = getDb();
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

export async function getPostsCount(options: {
  category?: PostCategory;
  status?: PostStatus;
  publicOnly?: boolean;
}) {
  const whereClause = buildPostWhereClause(options);
  const db = getDb();
  const totalNumberofPosts = await db
    .select({ count: count() })
    .from(PostsTable)
    .where(whereClause);
  return totalNumberofPosts[0].count;
}

export async function findPostById(id: number) {
  const db = getDb();
  const results = await db
    .select()
    .from(PostsTable)
    .where(eq(PostsTable.id, id));
  return uniqueOrThrow(results);
}

export async function findPostBySlug(slug: string) {
  const db = getDb();
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
export async function findPostBySlugPublic(slug: string) {
  const db = getDb();
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
  id: number,
  data: Partial<typeof PostsTable.$inferInsert>
) {
  const db = getDb();
  // Remove undefined values from the data object
  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([_, v]) => v !== undefined)
  );
  await db.update(PostsTable).set(cleanData).where(eq(PostsTable.id, id));
}

export async function deletePost(id: number) {
  const db = getDb();
  await db.delete(PostsTable).where(eq(PostsTable.id, id));
}
