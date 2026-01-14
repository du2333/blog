import { createServerFn } from "@tanstack/react-start";
import {
  DeleteSearchDocSchema,
  SearchQuerySchema,
  UpsertSearchDocSchema,
} from "@/features/search/search.schema";
import * as SearchService from "@/features/search/search.service";
import {
  adminMiddleware,
  createCacheHeaderMiddleware,
  createRateLimitMiddleware,
} from "@/lib/middlewares";

export const buildSearchIndexFn = createServerFn()
  .middleware([adminMiddleware])
  .handler(({ context }) => SearchService.rebuildIndex(context));

export const upsertSearchDocFn = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .inputValidator(UpsertSearchDocSchema)
  .handler(({ data, context }) => SearchService.upsert(context, data));

export const deleteSearchDocFn = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .inputValidator(DeleteSearchDocSchema)
  .handler(({ data, context }) => SearchService.deleteIndex(context, data));

export const searchDocsFn = createServerFn()
  .middleware([
    createCacheHeaderMiddleware("immutable"),
    createRateLimitMiddleware({
      capacity: 30,
      interval: "1m",
      key: "search:query",
    }),
  ])
  .inputValidator(SearchQuerySchema)
  .handler(({ data, context }) => SearchService.search(context, data));

export const getIndexVersionFn = createServerFn()
  .middleware([
    createCacheHeaderMiddleware("private"),
    createRateLimitMiddleware({
      capacity: 30,
      interval: "1m",
      key: "search:getIndexVersion",
    }),
  ])
  .handler(({ context }) => SearchService.getIndexVersion(context));
