import { queryOptions } from "@tanstack/react-query";
import {
  getCommentsByPostIdFn,
  getMyCommentsFn,
} from "./api/comments.public.api";
import { getAllCommentsFn } from "./api/comments.admin.api";
import type { CommentStatus } from "@/lib/db/schema";

export function commentsByPostIdQuery(postId: number, userId?: string) {
  return queryOptions({
    queryKey: ["comments", "post", postId, { userId }],
    queryFn: () => getCommentsByPostIdFn({ data: { postId } }),
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
