import { getDb } from "@/db";
import { PostsTable } from "@/db/schema";
import { eq } from "drizzle-orm";

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
      slug: PostsTable.slug,
      status: PostsTable.status,
      publishedAt: PostsTable.publishedAt,
      createdAt: PostsTable.createdAt,
      updatedAt: PostsTable.updatedAt,
    })
    .from(PostsTable)
    .limit(options.limit)
    .offset(options.offset);
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

export async function updatePost(
  id: number,
  data: Partial<typeof PostsTable.$inferInsert>
) {
  const db = getDb();
  await db.update(PostsTable).set(data).where(eq(PostsTable.id, id));
}
