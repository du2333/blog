import { and, asc, desc, eq, ne } from "drizzle-orm";
import type { BatchItem } from "drizzle-orm/batch";
import type { DB } from "@/lib/db";
import { PostTagsTable, TagsTable } from "@/lib/db/schema";

/**
 * Get all tags, optionally sorted
 */
export async function getAllTags(
  db: DB,
  options: {
    sortBy?: "name" | "createdAt";
    sortDir?: "asc" | "desc";
  } = {},
) {
  const { sortBy = "name", sortDir = "asc" } = options;

  const orderFn = sortDir === "asc" ? asc : desc;
  const orderColumn =
    sortBy === "createdAt" ? TagsTable.createdAt : TagsTable.name;

  return await db.select().from(TagsTable).orderBy(orderFn(orderColumn));
}

/**
 * Find a tag by ID
 */
export async function findTagById(db: DB, id: number) {
  return await db.query.TagsTable.findFirst({
    where: eq(TagsTable.id, id),
  });
}

/**
 * Find a tag by name
 */
export async function findTagByName(db: DB, name: string) {
  return await db.query.TagsTable.findFirst({
    where: eq(TagsTable.name, name),
  });
}

/**
 * Insert a new tag
 */
export async function insertTag(db: DB, data: typeof TagsTable.$inferInsert) {
  const [tag] = await db.insert(TagsTable).values(data).returning();
  return tag;
}

/**
 * Update a tag
 */
export async function updateTag(
  db: DB,
  id: number,
  data: Partial<Omit<typeof TagsTable.$inferInsert, "id" | "createdAt">>,
) {
  const [tag] = await db
    .update(TagsTable)
    .set(data)
    .where(eq(TagsTable.id, id))
    .returning();
  return tag;
}

/**
 * Delete a tag
 */
export async function deleteTag(db: DB, id: number) {
  await db.delete(TagsTable).where(eq(TagsTable.id, id));
}

/**
 * Get tags for a specific post
 */
export async function getTagsByPostId(db: DB, postId: number) {
  const results = await db
    .select({
      id: TagsTable.id,
      name: TagsTable.name,
      createdAt: TagsTable.createdAt,
    })
    .from(PostTagsTable)
    .innerJoin(TagsTable, eq(PostTagsTable.tagId, TagsTable.id))
    .where(eq(PostTagsTable.postId, postId))
    .orderBy(asc(TagsTable.name));

  return results;
}

/**
 * Set tags for a post (replace all existing tags).
 * Uses db.batch() to execute delete + insert in a single roundtrip.
 */
export async function setPostTags(
  db: DB,
  postId: number,
  tagIds: Array<number>,
) {
  const batchQueries: Array<BatchItem<"sqlite">> = [];

  // 1. 删除所有现有关联
  const deleteQuery = db
    .delete(PostTagsTable)
    .where(eq(PostTagsTable.postId, postId));

  // 2. 插入新关联
  if (tagIds.length > 0) {
    batchQueries.push(
      db.insert(PostTagsTable).values(
        tagIds.map((tagId) => ({
          postId,
          tagId,
        })),
      ),
    );
  }

  // 3. 批量执行 - 单次 roundtrip
  await db.batch([deleteQuery, ...batchQueries]);
}

/**
 * Check if a tag name exists
 */
export async function nameExists(
  db: DB,
  name: string,
  options: { excludeId?: number } = {},
): Promise<boolean> {
  const { excludeId } = options;
  const conditions = [eq(TagsTable.name, name)];
  if (excludeId) {
    conditions.push(ne(TagsTable.id, excludeId));
  }
  const results = await db
    .select({ id: TagsTable.id })
    .from(TagsTable)
    .where(and(...conditions))
    .limit(1);
  return results.length > 0;
}

/**
 * Delete all tag associations for a post.
 */
export async function deletePostTagAssociations(db: DB, postId: number) {
  await db.delete(PostTagsTable).where(eq(PostTagsTable.postId, postId));
}
