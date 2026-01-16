import { serializeKey } from "./cache.utils";
import type { z } from "zod";
import type { CacheKey, CacheNamespace } from "./types";
import type { Duration } from "@/lib/duration";
import { ms } from "@/lib/duration";

/**
 * 缓存数据
 * @param options.ttl - 缓存时间 (秒) 默认 3600 秒 (1 小时)
 */
export async function get<T extends z.ZodTypeAny>(
  context: BaseContext & { executionCtx: ExecutionContext },
  key: CacheKey,
  schema: T,
  fetcher: () => Promise<z.infer<T>>,
  options: { ttl?: Duration } = {},
): Promise<z.infer<T>> {
  const { ttl = "1h" } = options;
  const { env } = context;
  const serializedKey = serializeKey(key);

  const kvData = await env.KV.get(serializedKey, "json").catch((err) =>
    console.error(`[Cache] Failed to get key ${serializedKey}:`, err),
  );

  if (kvData !== null && kvData !== undefined) {
    const result = schema.safeParse(kvData);
    if (result.success) {
      console.log(`[Cache] HIT: ${serializedKey}`);
      return result.data;
    }
  }

  const data = await fetcher();

  if (data === null || data === undefined) return data;

  context.executionCtx.waitUntil(
    set(context, key, JSON.stringify(data), { ttl }),
  );

  console.log(`[Cache] MISS: ${serializedKey}`);
  return data;
}

/**
 * 读取单个缓存 key (不带 fetcher 回源逻辑)
 */
export async function getRaw(
  context: BaseContext,
  key: CacheKey,
): Promise<string | null> {
  const serializedKey = serializeKey(key);
  const value = await context.env.KV.get(serializedKey).catch((err) => {
    console.error(`[Cache] Failed to get key ${serializedKey}:`, err);
    return null;
  });
  return value;
}

/**
 * 设置缓存数据
 * @param options.ttl - 缓存时间 (秒)，不设置则永久
 */
export async function set(
  context: BaseContext,
  key: CacheKey,
  value: string,
  options?: { ttl?: Duration },
): Promise<void> {
  const serializedKey = serializeKey(key);
  const putOptions = options?.ttl
    ? { expirationTtl: Math.floor(ms(options.ttl) / 1000) }
    : undefined;

  await context.env.KV.put(serializedKey, value, putOptions)
    .then(() => console.log(`[Cache] SET: ${serializedKey}`))
    .catch((err) =>
      console.error(`[Cache] Failed to set key ${serializedKey}:`, err),
    );
}

export async function deleteKey(
  context: BaseContext,
  ...keys: Array<CacheKey>
): Promise<void> {
  const serializedKeys = keys.map(serializeKey);

  await Promise.all(
    serializedKeys.map((key) =>
      context.env.KV.delete(key).catch((err) =>
        console.error(`[Cache] Failed to delete key ${key}:`, err),
      ),
    ),
  );
}

/**
 * 获取缓存版本号
 * 规范：Namespace 建议使用 "entity:scope" 格式，如 "posts:list"
 */
export async function getVersion(
  context: BaseContext,
  namespace: CacheNamespace,
): Promise<string> {
  // 统一前缀 ver:，保持视觉整洁
  const key = `ver:${namespace}`;
  const v = await context.env.KV.get(key).catch((err) =>
    console.error(`[Cache] Failed to get version ${key}:`, err),
  );
  // 返回 "v1", "v2" 这种格式，方便直接拼到 Key 数组里
  if (v && !Number.isNaN(Number.parseInt(v))) {
    return `v${v}`;
  }
  return "v1";
}

/**
 * 升级版本号 -> 导致旧版本 Key 全部失效
 */
export async function bumpVersion(
  context: BaseContext,
  namespace: CacheNamespace,
): Promise<void> {
  const key = `ver:${namespace}`;
  const current = await context.env.KV.get(key).catch((err) =>
    console.error(`[Cache] Failed to get version ${key}:`, err),
  );

  let next = 1;
  if (current) {
    const parsed = Number.parseInt(current);
    if (!Number.isNaN(parsed)) {
      next = parsed + 1;
    }
  }

  await context.env.KV.put(key, next.toString()).catch((err) =>
    console.error(`[Cache] Failed to bump version ${key}:`, err),
  );
  console.log(`[Cache] Bumped version ${key} to ${next}`);
}
