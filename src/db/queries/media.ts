import { getDb } from "@/db";
import { MediaTable } from "@/db/schema";
import { and, desc, eq, lt, sql, sum, type SQL } from "drizzle-orm";
import { escapeLikeString } from "./helper";

export type Media = typeof MediaTable.$inferSelect;

export async function insertMedia(
  data: typeof MediaTable.$inferInsert
): Promise<Media> {
  const db = getDb();
  const [inserted] = await db.insert(MediaTable).values(data).returning();
  return inserted;
}

export async function deleteMedia(key: string) {
  const db = getDb();
  await db.delete(MediaTable).where(eq(MediaTable.key, key));
}

export async function updateMediaName(key: string, name: string) {
  const db = getDb();
  await db
    .update(MediaTable)
    .set({ fileName: name })
    .where(eq(MediaTable.key, key));
}

const DEFAULT_PAGE_SIZE = 20;

/**
 * 获取媒体列表 (Cursor-based pagination)
 * @param cursor - 上一页最后一条记录的 id，用于分页
 * @param limit - 每页数量
 * @param search - 搜索文件名
 */
export async function getMediaList(options?: {
  cursor?: number;
  limit?: number;
  search?: string;
}): Promise<{ items: Media[]; nextCursor: number | null }> {
  const db = getDb();
  const { cursor, limit = DEFAULT_PAGE_SIZE, search } = options ?? {};

  // 构建条件
  const conditions: SQL[] = [];
  if (cursor) {
    conditions.push(lt(MediaTable.id, cursor));
  }
  if (search) {
    const pattern = `%${escapeLikeString(search)}%`;
    conditions.push(sql`${MediaTable.fileName} LIKE ${pattern} ESCAPE '\\'`);
  }

  const items = await db
    .select()
    .from(MediaTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(MediaTable.id))
    .limit(limit + 1);

  // 判断是否有下一页
  const hasMore = items.length > limit;
  if (hasMore) {
    items.pop(); // 移除多取的一条
  }

  const nextCursor = hasMore ? items[items.length - 1]?.id ?? null : null;

  return { items, nextCursor };
}

export async function getTotalMediaSize() {
  const db = getDb();

  const [result] = await db
    .select({ total: sum(MediaTable.sizeInBytes) })
    .from(MediaTable);

  return Number(result?.total ?? 0);
}
