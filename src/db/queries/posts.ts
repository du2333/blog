import { getDb } from "@/db";
import { PostsTable } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function insertPost(data: typeof PostsTable.$inferInsert) {
  const db = getDb();
  await db.insert(PostsTable).values(data);
}

export async function getPosts(options: { offset: number; limit: number }) {
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
    .orderBy(desc(PostsTable.publishedAt));
  return posts;
}

export async function getPostById(id: number) {
  const db = getDb();
  const [post] = await db
    .select()
    .from(PostsTable)
    .where(eq(PostsTable.id, id));
  return post;
}

export async function getPostBySlug(slug: string) {
  const db = getDb();
  const [post] = await db
    .select()
    .from(PostsTable)
    .where(eq(PostsTable.slug, slug));
  return post;
}

export async function updatePost(
  id: number,
  data: Partial<typeof PostsTable.$inferInsert>
) {
  const db = getDb();
  await db.update(PostsTable).set(data).where(eq(PostsTable.id, id));
}
