import { createServerFn } from "@tanstack/react-start";
import {
  DeleteSearchDocSchema,
  SearchQuerySchema,
  UpsertSearchDocSchema,
} from "@/features/search/search.schema";
import * as SearchService from "@/features/search/search.service";
import {
  createAdminFn,
  createRateLimitMiddleware,
  immutableCacheMiddleware,
  noCacheMiddleware,
} from "@/lib/middlewares";

export const buildSearchIndexFn = createAdminFn().handler(({ context }) =>
  SearchService.rebuildIndex(context),
);

export const upsertSearchDocFn = createAdminFn({ method: "POST" })
  .inputValidator(UpsertSearchDocSchema)
  .handler(({ data, context }) => SearchService.upsert(context, data));

export const deleteSearchDocFn = createAdminFn({ method: "POST" })
  .inputValidator(DeleteSearchDocSchema)
  .handler(({ data, context }) => SearchService.deleteIndex(context, data));

export const searchDocsFn = createServerFn()
  .middleware([
    immutableCacheMiddleware,
    createRateLimitMiddleware({
      capacity: 30,
      interval: "1m",
    }),
  ])
  .inputValidator(SearchQuerySchema)
  .handler(({ data, context }) => SearchService.search(context, data));

export const getIndexVersionFn = createServerFn()
  .middleware([
    noCacheMiddleware,
    createRateLimitMiddleware({
      capacity: 30,
      interval: "1m",
    }),
  ])
  .handler(({ context }) => SearchService.getIndexVersion(context));
