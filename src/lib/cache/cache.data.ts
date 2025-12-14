import { z } from "zod";
import {
  createJsonResponse,
  getCache,
  logCache,
  serializeKey,
} from "./cache.utils";
import { CacheKey, CacheNamespace, Context } from "./types";

/**
 * 智能数据缓存
 * 流程: L1 (Cache API) -> L2 (KV) -> L3 (Fetcher) -> 回写 L1 & L2
 */
export async function cachedData<T extends z.ZodTypeAny>(
  context: Context,
  key: CacheKey,
  schema: T,
  fetcher: () => Promise<z.infer<T>>,
  options: { ttlL1?: number; ttlL2?: number } = {}
): Promise<z.infer<T>> {
  const { ttlL1 = 60, ttlL2 = 3600 } = options;

  // 1. 序列化 Key
  const serializedKey = serializeKey(key);
  const cacheKeyUrl = `http://cache/${serializedKey}`; // 统一构建 Cache API 用的伪造 URL
  const cache = getCache();

  // 1. 尝试 L1 (Cache API)
  const cachedRes = await cache.match(cacheKeyUrl);
  if (cachedRes) {
    const data = await cachedRes.json();
    const result = schema.safeParse(data);
    if (result.success) {
      logCache("L1", serializedKey);
      return result.data;
    }
  }

  // 2. 尝试 L2 (KV)
  const kvData = await context.env.KV.get(serializedKey, "json");
  if (kvData) {
    const result = schema.safeParse(kvData);
    if (result.success) {
      logCache("L2", serializedKey);
      // 命中 KV -> 异步回写 L1 (热启动 Cache API)
      context.executionCtx.waitUntil(
        cache.put(cacheKeyUrl, createJsonResponse(result.data, ttlL1))
      );
      return result.data;
    }
  }

  // 3. 尝试 L3 (源数据/DB)
  logCache("MISS", serializedKey);
  const data = await fetcher();

  // 如果数据为空，直接返回 (或者你可以选择是否缓存空值)
  if (data === null || data === undefined) return data;

  // 4. 双写缓存 (L1 + L2)
  context.executionCtx.waitUntil(
    Promise.all([
      cache.put(cacheKeyUrl, createJsonResponse(data, ttlL1)),
      context.env.KV.put(serializedKey, JSON.stringify(data), {
        expirationTtl: ttlL2,
      }),
    ])
  );

  return data;
}

/**
 * 精确删除指定 Key 的缓存 (同时删 L1 和 L2)
 * 支持传入多个 Key，每个 Key 可以是字符串或数组
 */
export async function deleteCachedData(
  context: { env: Env },
  ...keys: CacheKey[]
): Promise<void> {
  const cache = getCache();
  const serializedKeys = keys.map(serializeKey);

  await Promise.all(
    serializedKeys.map(async (key) => {
      const cacheKeyUrl = `http://cache/${key}`;
      // 同时删除 L1 和 L2
      await Promise.all([
        cache.delete(cacheKeyUrl).then((success) => {
          if (!success) {
            console.error(
              "[Data Cache] Failed to delete cached data:",
              cacheKeyUrl
            );
          }
        }),
        context.env.KV.delete(key),
      ]);
    })
  );
}

/**
 * 获取缓存版本号
 * 规范：Namespace 建议使用 "entity:scope" 格式，如 "posts:list"
 */
export async function getCacheVersion(
  context: { env: Env },
  namespace: CacheNamespace
): Promise<string> {
  // 统一前缀 ver:，保持视觉整洁
  const key = `ver:${namespace}`;
  const v = await context.env.KV.get(key);
  // 返回 "v1", "v2" 这种格式，方便直接拼到 Key 数组里
  if (v && !Number.isNaN(parseInt(v))) {
    return `v${v}`;
  }
  return "v1";
}

/**
 * 升级版本号 -> 导致旧版本 Key 全部失效
 */
export async function bumpCacheVersion(
  context: { env: Env },
  namespace: CacheNamespace
): Promise<void> {
  const key = `ver:${namespace}`;
  const current = await context.env.KV.get(key);

  let next = 1;
  if (current) {
    const parsed = parseInt(current);
    if (!Number.isNaN(parsed)) {
      next = parsed + 1;
    }
  }

  await context.env.KV.put(key, next.toString());
  console.log(`[Cache] Bumped version ${key} to ${next}`);
}
