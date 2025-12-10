// ============================================
// Cloudflare Cache API
// ============================================

/**
 * 获取 Cloudflare 默认缓存实例
 */
function getCache(): Cache {
  return (caches as unknown as { default: Cache }).default;
}

/**
 * 统一缓存键：强制使用虚拟 host，避免相对路径/不同域导致的 URL 解析错误或键不一致。
 */
function normalizeCacheKey(request: Request | string): Request {
  if (typeof request === "string") {
    const url = new URL(request, "http://cache");
    return new Request(url.toString());
  }

  const url = new URL(request.url);
  url.protocol = "http";
  url.hostname = "cache";
  url.port = "";

  return new Request(url.toString(), request);
}

/**
 * 从缓存中获取响应
 * @param request - 请求对象或 URL 字符串
 * @returns 缓存的响应，如果未命中则返回 null
 */
export async function cacheGet(
  request: Request | string
): Promise<Response | null> {
  const cache = getCache();
  const cacheKey = normalizeCacheKey(request);
  const response = await cache.match(cacheKey);
  return response ?? null;
}

/**
 * 将响应存入缓存
 * @param request - 请求对象或 URL 字符串
 * @param response - 要缓存的响应
 * @param options - 缓存选项
 */
export async function cachePut(
  executionCtx: ExecutionContext,
  request: Request | string,
  response: Response,
  options?: {
    /** 是否使用 waitUntil 异步写入（默认 true） */
    async?: boolean;
  }
): Promise<void> {
  const cache = getCache();
  const cacheKey = normalizeCacheKey(request);
  const { async: isAsync = true } = options ?? {};

  if (isAsync) {
    executionCtx.waitUntil(
      (async (): Promise<void> => {
        try {
          await cache.put(cacheKey, response);
          console.log(`Cache put: ${cacheKey.url}`);
        } catch (error) {
          console.error("Error putting cache:", error);
        }
      })()
    );
  } else {
    await cache.put(cacheKey, response);
  }
}

/**
 * 从缓存中删除响应
 * @param request - 请求对象或 URL 字符串
 * @returns 是否成功删除
 */
export async function cacheDelete(request: Request | string): Promise<boolean> {
  const cache = getCache();
  const cacheKey = normalizeCacheKey(request);
  try {
    return await cache.delete(cacheKey);
  } catch (error) {
    console.error("Error deleting cache:", error);
    return false;
  }
}

/**
 * 缓存包装器 - 自动处理缓存命中/未命中逻辑
 * @param request - 请求对象或 URL 字符串
 * @param fetcher - 缓存未命中时执行的获取函数
 * @param options - 缓存选项
 * @returns 响应对象
 */
export async function cacheWrap(
  executionCtx: ExecutionContext,
  request: Request | string,
  fetcher: () => Promise<Response>,
  options?: {
    /** 是否缓存响应（默认 true） */
    shouldCache?: boolean | ((response: Response) => boolean);
    /** 响应预处理（在缓存前修改响应） */
    transform?: (response: Response) => Response;
  }
): Promise<Response> {
  const { shouldCache = true, transform } = options ?? {};

  // 1. 尝试从缓存获取
  const cached = await cacheGet(request);
  if (cached) {
    return cached;
  }

  // 2. 执行 fetcher 获取新响应
  let response = await fetcher();

  // 3. 应用转换
  if (transform) {
    response = transform(response);
  }

  // 4. 判断是否需要缓存
  const shouldCacheResult =
    typeof shouldCache === "function" ? shouldCache(response) : shouldCache;

  if (shouldCacheResult && response.ok) {
    const responseToCache = response.clone();
    await cachePut(executionCtx, request, responseToCache);
  }

  return response;
}
