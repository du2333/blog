import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createCommentFn, deleteCommentFn } from "../api/comments.public.api";
import {
  adminDeleteCommentFn,
  moderateCommentFn,
} from "../api/comments.admin.api";

export function useComments(postId?: number) {
  const queryClient = useQueryClient();

  const createCommentMutation = useMutation({
    mutationFn: createCommentFn,
    onSuccess: () => {
      if (postId) {
        queryClient.invalidateQueries({
          queryKey: ["comments", "post", postId],
        });
      }
    },
    onError: (error) => {
      toast.error("评论提交失败: " + error.message);
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: deleteCommentFn,
    onSuccess: () => {
      if (postId) {
        queryClient.invalidateQueries({
          queryKey: ["comments", "post", postId],
        });
      }
      toast.success("评论已删除");
    },
    onError: (error) => {
      toast.error("删除失败: " + error.message);
    },
  });

  return {
    createComment: createCommentMutation.mutateAsync,
    isCreating: createCommentMutation.isPending,
    deleteComment: deleteCommentMutation.mutateAsync,
    isDeleting: deleteCommentMutation.isPending,
  };
}

export function useAdminComments() {
  const queryClient = useQueryClient();

  const moderateMutation = useMutation({
    mutationFn: moderateCommentFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", "all"] });
      toast.success("审核操作成功");
    },
    onError: (error) => {
      toast.error("操作失败: " + error.message);
    },
  });

  const adminDeleteMutation = useMutation({
    mutationFn: adminDeleteCommentFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", "all"] });
      toast.success("评论已永久删除");
    },
    onError: (error) => {
      toast.error("删除失败: " + error.message);
    },
  });

  return {
    moderate: moderateMutation.mutateAsync,
    isModerating: moderateMutation.isPending,
    adminDelete: adminDeleteMutation.mutateAsync,
    isAdminDeleting: adminDeleteMutation.isPending,
  };
}
