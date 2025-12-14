import { getCache } from "./cache.utils";

/**
 * 图片/静态资源缓存 (仅 L1 Cache API)
 */
export async function cachedAsset(
  context: { waitUntil: ExecutionContext["waitUntil"] },
  key: string,
  fetcher: () => Promise<Response>
): Promise<Response> {
  const cache = getCache();
  const cacheKey = getCacheKey(key);

  // 1. 查 Cache
  const cachedRes = await cache.match(cacheKey);
  if (cachedRes) {
    const newRes = new Response(cachedRes.body, cachedRes);
    newRes.headers.set("X-Cache-Status", "HIT-L1");
    return newRes;
  }

  // 2. 回源
  const originRes = await fetcher();

  // 3. 写入 Cache (仅当请求成功时)
  // 必须在读取 body 之前 clone，因为 body 只能读一次
  if (originRes.ok) {
    context.waitUntil(cache.put(cacheKey, originRes.clone()));
  }

  // 4. 返回响应（添加缓存状态头）
  const responseToReturn = new Response(originRes.body, originRes);
  responseToReturn.headers.set("X-Cache-Status", "MISS");
  return responseToReturn;
}

/**
 * 删除资源缓存
 */
export async function deleteCachedAsset(key: string): Promise<boolean> {
  const cache = getCache();
  const cacheKey = getCacheKey(key);

  const success = await cache.delete(cacheKey);
  if (!success) {
    console.error("[Asset Cache] Failed to delete cached asset:", cacheKey);
  }
  return success;
}

const getCacheKey = (key: string) =>
  new Request(new URL(key, "http://cache"), { method: "GET" });
