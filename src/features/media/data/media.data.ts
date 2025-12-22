import { and, desc, eq, lt, type SQL, sql, sum } from "drizzle-orm";
import type { DB } from "@/lib/db";
import { MediaTable } from "@/lib/db/schema";
import { escapeLikeString } from "./helper";

export type Media = typeof MediaTable.$inferSelect;

export async function insertMedia(
	db: DB,
	data: typeof MediaTable.$inferInsert,
): Promise<Media> {
	const [inserted] = await db.insert(MediaTable).values(data).returning();
	return inserted;
}

export async function deleteMedia(db: DB, key: string) {
	await db.delete(MediaTable).where(eq(MediaTable.key, key));
}

export async function updateMediaName(db: DB, key: string, name: string) {
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
export async function getMediaList(
	db: DB,
	options?: {
		cursor?: number;
		limit?: number;
		search?: string;
	},
): Promise<{ items: Media[]; nextCursor: number | null }> {
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

	const nextCursor = hasMore ? (items[items.length - 1]?.id ?? null) : null;

	return { items, nextCursor };
}

export async function getTotalMediaSize(db: DB) {
	const [result] = await db
		.select({ total: sum(MediaTable.sizeInBytes) })
		.from(MediaTable);

	return Number(result?.total ?? 0);
}
