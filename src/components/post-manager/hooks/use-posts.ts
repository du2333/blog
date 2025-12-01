import { deletePostFn, getPostsCountFn, getPostsFn } from "@/functions/posts";
import { ADMIN_ITEMS_PER_PAGE } from "@/lib/constants";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { filterToStatus, type PostFilter, type PostListItem } from "../types";

interface UsePostsOptions {
  page: number;
  filter: PostFilter;
}

export function usePosts({ page, filter }: UsePostsOptions) {
  const status = filterToStatus(filter);

  const postsQuery = useQuery({
    queryKey: ["posts", page, filter],
    queryFn: () =>
      getPostsFn({
        data: {
          offset: (page - 1) * ADMIN_ITEMS_PER_PAGE,
          limit: ADMIN_ITEMS_PER_PAGE,
          status,
        },
      }),
  });

  const countQuery = useQuery({
    queryKey: ["postsCount", filter],
    queryFn: () => getPostsCountFn({ data: { status } }),
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
      toast.success("POST DELETED", {
        description: `ENTRY "${post.title}" deleted successfully`,
      });
      onSuccess?.();
    },
    onError: (_error, post) => {
      toast.error("FAILED TO DELETE ENTRY", {
        description: `Failed to delete entry "${post.title}"`,
      });
    },
  });
}
