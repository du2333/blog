import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import type {
  CategoryFilter,
  SortDirection,
  StatusFilter,
} from "@/features/posts/components/post-manager/types";
import { PostManager } from "@/features/posts/components/post-manager";
import {
  CATEGORY_FILTERS,
  SORT_DIRECTIONS,
  STATUS_FILTERS,
} from "@/features/posts/components/post-manager/types";

const searchSchema = z.object({
  page: z.number().int().positive().optional().default(1).catch(1),
  status: z.enum(STATUS_FILTERS).optional().default("ALL").catch("ALL"),
  category: z.enum(CATEGORY_FILTERS).optional().default("ALL").catch("ALL"),
  sortDir: z.enum(SORT_DIRECTIONS).optional().default("DESC").catch("DESC"),
  search: z.string().optional().default("").catch(""),
});

export type PostsSearchParams = z.infer<typeof searchSchema>;

export const Route = createFileRoute("/admin/posts/")({
  validateSearch: searchSchema,
  component: PostManagerPage,
  head: () => ({
    meta: [
      {
        title: "文章管理",
      },
    ],
  }),
});

function PostManagerPage() {
  const navigate = useNavigate();
  const { page, status, category, sortDir, search } = Route.useSearch();

  const updateSearch = (updates: Partial<PostsSearchParams>) => {
    navigate({
      to: "/admin/posts",
      search: (prev) => ({
        ...prev,
        ...updates,
        // Reset to page 1 when filters change (except for page changes)
        page: updates.page ?? 1,
      }),
    });
  };

  const handlePageChange = (newPage: number) => {
    updateSearch({ page: newPage });
  };

  const handleStatusChange = (newStatus: StatusFilter) => {
    updateSearch({ status: newStatus });
  };

  const handleCategoryChange = (newCategory: CategoryFilter) => {
    updateSearch({ category: newCategory });
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
        category: "ALL",
        sortDir: "DESC",
        search: "",
      },
    });
  };

  return (
    <PostManager
      page={page}
      status={status}
      category={category}
      sortDir={sortDir}
      search={search}
      onPageChange={handlePageChange}
      onStatusChange={handleStatusChange}
      onCategoryChange={handleCategoryChange}
      onSortChange={handleSortChange}
      onSearchChange={handleSearchChange}
      onResetFilters={handleResetFilters}
    />
  );
}
