import { getDb } from "@/db";
import { PostCategory, PostStatus, PostsTable } from "@/db/schema";
import { and, count, desc, eq } from "drizzle-orm";
import { uniqueOrThrow } from "@/db/queries/helper";

export async function insertPost(data: typeof PostsTable.$inferInsert) {
  const db = getDb();
  await db.insert(PostsTable).values(data);
}

export async function getPosts(options: {
  offset: number;
  limit: number;
  category?: PostCategory;
  status?: PostStatus;
}) {
  const whereClauses = [];
  if (options.category) {
    whereClauses.push(eq(PostsTable.category, options.category));
  }
  if (options.status) {
    whereClauses.push(eq(PostsTable.status, options.status));
  }

  const whereClause =
    whereClauses.length > 0 ? and(...whereClauses) : undefined;

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
    .limit(options.limit)
    .offset(options.offset)
    .orderBy(desc(PostsTable.publishedAt))
    .where(whereClause);
  return posts;
}

export async function getPostsCount(options: {
  category?: PostCategory;
  status?: PostStatus;
}) {
  const whereClauses = [];
  if (options.category) {
    whereClauses.push(eq(PostsTable.category, options.category));
  }
  if (options.status) {
    whereClauses.push(eq(PostsTable.status, options.status));
  }
  const whereClause =
    whereClauses.length > 0 ? and(...whereClauses) : undefined;

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

export async function updatePost(
  id: number,
  data: Partial<typeof PostsTable.$inferInsert>
) {
  const db = getDb();
  await db.update(PostsTable).set(data).where(eq(PostsTable.id, id));
}
