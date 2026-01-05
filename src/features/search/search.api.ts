import { createServerFn } from "@tanstack/react-start";
import {
  DeleteSearchDocSchema,
  SearchQuerySchema,
  UpsertSearchDocSchema,
} from "@/features/search/search.schema";
import * as SearchService from "@/features/search/search.service";
import { createAdminFn, noCacheMiddleware } from "@/lib/middlewares";

export const buildSearchIndexFn = createAdminFn().handler(
  async ({ context }) => {
    return await SearchService.rebuildIndex(context);
  },
);

export const upsertSearchDocFn = createAdminFn({ method: "POST" })
  .inputValidator(UpsertSearchDocSchema)
  .handler(async ({ data, context }) => {
    return await SearchService.upsert(context, data);
  });

export const deleteSearchDocFn = createAdminFn({ method: "POST" })
  .inputValidator(DeleteSearchDocSchema)
  .handler(async ({ data, context }) => {
    return await SearchService.deleteIndex(context, data);
  });

export const searchDocsFn = createServerFn().middleware([noCacheMiddleware])
  .inputValidator(SearchQuerySchema)
  .handler(async ({ data, context }) => {
    return await SearchService.search(context, data);
  });
