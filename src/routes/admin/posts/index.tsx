import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import type {
  SortDirection,
  StatusFilter,
} from "@/features/posts/components/post-manager/types";
import { PostManager } from "@/features/posts/components/post-manager";
import {
  SORT_DIRECTIONS,
  STATUS_FILTERS,
} from "@/features/posts/components/post-manager/types";

const searchSchema = z.object({
  page: z.number().int().positive().optional().default(1).catch(1),
  status: z.enum(STATUS_FILTERS).optional().default("ALL").catch("ALL"),
  sortDir: z.enum(SORT_DIRECTIONS).optional().default("DESC").catch("DESC"),
  search: z.string().optional().default("").catch(""),
});

export type PostsSearchParams = z.infer<typeof searchSchema>;

export const Route = createFileRoute("/admin/posts/")({
  validateSearch: searchSchema,
  component: PostManagerPage,
});

function PostManagerPage() {
  const navigate = useNavigate();
  const { page, status, sortDir, search } = Route.useSearch();

  const updateSearch = (updates: Partial<PostsSearchParams>) => {
    navigate({
      to: "/admin/posts",
      // IMPORTANT: Don't spread `prev` here.
      // Other /admin routes can use the same query param names (e.g. `status`)
      // with different value domains; spreading would leak invalid values.
      search: {
        page: updates.page ?? 1,
        status: updates.status ?? status,
        sortDir: updates.sortDir ?? sortDir,
        search: updates.search ?? search,
      },
    });
  };

  const handlePageChange = (newPage: number) => {
    updateSearch({ page: newPage });
  };

  const handleStatusChange = (newStatus: StatusFilter) => {
    updateSearch({ status: newStatus });
  };

  const handleSortChange = (dir: SortDirection) => {
    updateSearch({ sortDir: dir });
  };

  const handleSearchChange = (newSearch: string) => {
    updateSearch({ search: newSearch });
  };

  const handleResetFilters = () => {
    navigate({
      to: "/admin/posts",
      search: {
        page: 1,
        status: "ALL",
        sortDir: "DESC",
        search: "",
      },
    });
  };

  return (
    <PostManager
      page={page}
      status={status}
      sortDir={sortDir}
      search={search}
      onPageChange={handlePageChange}
      onStatusChange={handleStatusChange}
      onSortChange={handleSortChange}
      onSearchChange={handleSearchChange}
      onResetFilters={handleResetFilters}
    />
  );
}
