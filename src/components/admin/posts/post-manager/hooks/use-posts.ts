import {
  deletePostFn,
  getPostsCountFn,
  getPostsFn,
} from "@/features/posts/api/posts.admin.api";
import { ADMIN_ITEMS_PER_PAGE } from "@/lib/constants";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  categoryFilterToApi,
  statusFilterToApi,
  type CategoryFilter,
  type PostListItem,
  type SortDirection,
  type StatusFilter,
} from "../types";

interface UsePostsOptions {
  page: number;
  status: StatusFilter;
  category: CategoryFilter;
  sortDir: SortDirection;
  search: string;
}

export function usePosts({
  page,
  status,
  category,
  sortDir,
  search,
}: UsePostsOptions) {
  const apiStatus = statusFilterToApi(status);
  const apiCategory = categoryFilterToApi(category);

  const postsQuery = useQuery({
    queryKey: ["posts", page, status, category, sortDir, search],
    queryFn: () =>
      getPostsFn({
        data: {
          offset: (page - 1) * ADMIN_ITEMS_PER_PAGE,
          limit: ADMIN_ITEMS_PER_PAGE,
          status: apiStatus,
          category: apiCategory,
          sortDir,
          search: search || undefined,
        },
      }),
  });

  const countQuery = useQuery({
    queryKey: ["postsCount", status, category, search],
    queryFn: () =>
      getPostsCountFn({
        data: {
          status: apiStatus,
          category: apiCategory,
          search: search || undefined,
        },
      }),
  });

  const totalPages = Math.ceil((countQuery.data ?? 0) / ADMIN_ITEMS_PER_PAGE);

  return {
    posts: postsQuery.data ?? [],
    totalCount: countQuery.data ?? 0,
    totalPages,
    isPending: postsQuery.isPending,
    error: postsQuery.error,
  };
}

interface UseDeletePostOptions {
  onSuccess?: () => void;
}

export function useDeletePost({ onSuccess }: UseDeletePostOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (post: PostListItem) => deletePostFn({ data: { id: post.id } }),
    onSuccess: (_data, post) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["postsCount"] });
      toast.success("条目已删除", {
        description: `条目 "${post.title}" 已删除成功`,
      });
      onSuccess?.();
    },
    onError: (_error, post) => {
      toast.error("删除条目失败", {
        description: `删除条目 "${post.title}" 失败`,
      });
    },
  });
}
