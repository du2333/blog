export interface Context {
  env: Env;
  executionCtx: ExecutionContext;
}

export type CacheKey =
  | string
  | Array<string | number | boolean | null | undefined>;

export const CACHE_NAMESPACES = {
  POSTS_LIST: "posts:list",
} as const;

export type CacheNamespace =
  (typeof CACHE_NAMESPACES)[keyof typeof CACHE_NAMESPACES];
