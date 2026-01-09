import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import {
  getMyCommentsFn,
  getRepliesByRootIdFn,
  getRootCommentsByPostIdFn,
} from "./api/comments.public.api";
import { getAllCommentsFn } from "./api/comments.admin.api";
import type { CommentStatus } from "@/lib/db/schema";

export function rootCommentsByPostIdQuery(postId: number, userId?: string) {
  return queryOptions({
    queryKey: ["comments", "roots", "post", postId, { userId }],
    queryFn: () => getRootCommentsByPostIdFn({ data: { postId } }),
  });
}

export function repliesByRootIdInfiniteQuery(
  postId: number,
  rootId: number,
  userId?: string,
) {
  return infiniteQueryOptions({
    queryKey: [
      "comments",
      "replies",
      "post",
      postId,
      "root",
      rootId,
      { userId },
    ],
    queryFn: ({ pageParam = 0 }) =>
      getRepliesByRootIdFn({
        data: { postId, rootId, offset: pageParam, limit: 20 },
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const totalLoaded = allPages.reduce(
        (sum, page) => sum + page.items.length,
        0,
      );
      return totalLoaded < lastPage.total ? totalLoaded : undefined;
    },
  });
}

export function myCommentsQuery(
  options: {
    offset?: number;
    limit?: number;
    status?: CommentStatus;
  } = {},
) {
  return queryOptions({
    queryKey: ["comments", "mine", options],
    queryFn: () => getMyCommentsFn({ data: options }),
  });
}

export function allCommentsQuery(
  options: {
    offset?: number;
    limit?: number;
    status?: CommentStatus;
    postId?: number;
    userId?: string;
  } = {},
) {
  return queryOptions({
    queryKey: ["comments", "all", options],
    queryFn: () => getAllCommentsFn({ data: options }),
  });
}
