import { CacheKey } from "./types";

/**
 * 将 CacheKey 序列化为字符串
 * 示例: ["posts", "list", "tech", 1] -> "posts:list:tech:1"
 */
export function serializeKey(key: CacheKey): string {
  if (typeof key === "string") return key;
  return key
    .map((k) => {
      if (k === null || k === undefined) return "_";
      return String(k);
    })
    .join(":");
}

export function createJsonResponse(data: any, maxAge: number): Response {
  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      // Cache API 极其依赖这个 Header
      "Cache-Control": `public, max-age=${maxAge}`,
    },
  });
}

export const getCache = () => (caches as any).default as Cache;

export const logCache = (level: "L1" | "L2" | "MISS", key: string) => {
  console.log(`[Cache] [${level}] ${key}`);
};
