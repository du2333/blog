import { queryOptions } from "@tanstack/react-query";
import { getIndexVersionFn, searchDocsFn } from "../search.api";

export const SEARCH_KEYS = {
  all: ["search"] as const,

  // Leaf keys (static arrays - no child queries)
  meta: ["search", "meta"] as const,

  // Child keys (functions for specific queries)
  results: (query: string, version: string) =>
    ["search", "results", query, version] as const,
};

export const searchMetaQuery = queryOptions({
  queryKey: SEARCH_KEYS.meta,
  queryFn: () => getIndexVersionFn(),
});

export const searchDocsQueryOptions = (query: string, version: string) =>
  queryOptions({
    queryKey: SEARCH_KEYS.results(query, version),
    queryFn: () => searchDocsFn({ data: { q: query, v: version } }),
  });
