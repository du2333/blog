import { z } from "zod";

interface Context {
  env: Env;
  waitUntil: ExecutionContext["waitUntil"];
}

// workers cache api
const getCache = () => (caches as any).default as Cache;

const logCache = (level: "L1" | "L2" | "MISS", key: string) => {
  console.log(`[Cache] [${level}] ${key}`);
};

// ==========================================
// 核心工具 1: 数据缓存 (L1 Cache API -> L2 KV -> L3 DB)
// ==========================================

/**
 * 智能数据缓存函数
 * @param context Workers 上下文
 * @param key 业务键 (如 "post-123")，不要带 http 前缀
 * @param schema Zod Schema 用于验证数据
 * @param fetcher 数据库查询函数
 * @param options TTL 配置 (秒)
 */
export async function cachedData<T extends z.ZodTypeAny>(
  context: Context,
  key: string,
  schema: T,
  fetcher: () => Promise<z.infer<T>>,
  options: { ttlL1?: number; ttlL2?: number } = {}
): Promise<z.infer<T>> {
  const { ttlL1 = 60, ttlL2 = 3600 } = options;
  const cacheKeyUrl = `http://cache/${key}`; // 统一构建 Cache API 用的伪造 URL
  const cache = getCache();

  // 1. 尝试 L1 (Cache API)
  const cachedRes = await cache.match(cacheKeyUrl);
  if (cachedRes) {
    const data = await cachedRes.json();
    const result = schema.safeParse(data);
    if (result.success) {
      logCache("L1", key);
      return result.data;
    }
  }

  // 2. 尝试 L2 (KV)
  const kvData = await context.env.KV.get(key, "json");
  if (kvData) {
    const result = schema.safeParse(kvData);
    if (result.success) {
      logCache("L2", key);
      // 命中 KV -> 异步回写 L1 (热启动 Cache API)
      context.waitUntil(
        cache.put(cacheKeyUrl, createJsonResponse(result.data, ttlL1))
      );
      return result.data;
    }
  }

  // 3. 尝试 L3 (源数据/DB)
  logCache("MISS", key);
  const data = await fetcher();

  // 如果数据为空，直接返回 (或者你可以选择是否缓存空值)
  if (data === null || data === undefined) return data;

  // 4. 双写缓存 (L1 + L2)
  context.waitUntil(
    Promise.all([
      // 写 L1: 依赖 Cache-Control 头自动管理过期
      cache.put(cacheKeyUrl, createJsonResponse(data, ttlL1)),
      // 写 L2: 依赖 KV 的 expirationTtl
      context.env.KV.put(key, JSON.stringify(data), {
        expirationTtl: ttlL2,
      }),
    ])
  );

  return data;
}

/**
 * 删除数据缓存 (同时清除 L1 和 L2)
 * @param context 需要 env
 * @param key 业务键 (如 "post-123")
 */
export async function deleteCachedData(
  context: { env: Env },
  key: string
): Promise<void> {
  const cacheKeyUrl = `http://cache/${key}`;
  const cache = getCache();

  await Promise.all([
    cache.delete(cacheKeyUrl).then((success) => {
      if (!success) {
        console.error(
          "[Data Cache] Failed to delete cached data:",
          cacheKeyUrl
        );
      }
    }), // 删 L1
    context.env.KV.delete(key), // 删 L2
  ]);
}

// ==========================================
// 核心工具 2: 静态资源/图片缓存 (L1 Cache API Only)
// ==========================================

/**
 * 图片/文件流缓存
 * @param context 需要 waitUntil
 * @param request 原始 Request 或 URL 字符串
 * @param fetcher获取资源的函数 (如 fetch(r2_url))
 */
export async function cachedAsset(
  context: { waitUntil: ExecutionContext["waitUntil"] },
  request: Request | string,
  fetcher: () => Promise<Response>
): Promise<Response> {
  const cache = getCache();
  // 统一转为 Request 对象以便 Cache API 识别
  const cacheKey =
    typeof request === "string"
      ? new Request(new URL(request, "http://cache"), { method: "GET" })
      : request;

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
export async function deleteCachedAsset(
  request: Request | string
): Promise<boolean> {
  const cache = getCache();
  const cacheKey =
    typeof request === "string"
      ? new Request(new URL(request, "http://cache"), { method: "GET" })
      : request;

  const success = await cache.delete(cacheKey);
  if (!success) {
    console.error("[Asset Cache] Failed to delete cached asset:", cacheKey);
  }
  return success;
}

// ==========================================
// 内部辅助函数
// ==========================================

function createJsonResponse(data: any, maxAge: number): Response {
  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      // Cache API 极其依赖这个 Header
      "Cache-Control": `public, max-age=${maxAge}`,
    },
  });
}
