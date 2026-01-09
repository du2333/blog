import { useQuery } from "@tanstack/react-query";
import { Loader2, MessageSquareOff } from "lucide-react";
import { allCommentsQuery } from "../../comments.query";
import { renderCommentReact } from "../view/comment-render";
import { CommentModerationActions } from "./comment-moderation-actions";
import type { CommentStatus } from "@/lib/db/schema";
import type { JSONContent } from "@tiptap/react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface CommentModerationTableProps {
  status?: CommentStatus;
  postId?: number;
}

export const CommentModerationTable = ({
  status,
  postId,
}: CommentModerationTableProps) => {
  const { data: response, isLoading } = useQuery(
    allCommentsQuery({ status, postId, limit: 50 }),
  );

  if (isLoading) {
    return (
      <div className="py-24 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!response || response.items.length === 0) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-muted-foreground font-serif italic gap-4 border-t border-border">
        <MessageSquareOff size={40} strokeWidth={1} className="opacity-20" />
        <p>未找到匹配的评论</p>
      </div>
    );
  }

  return (
    <div className="border-t border-border">
      {/* Table Header */}
      <div className="hidden md:grid grid-cols-12 gap-6 px-6 py-4 text-[9px] uppercase tracking-[0.3em] text-muted-foreground font-bold border-b border-border bg-accent/5">
        <div className="col-span-2">作者 / 时间</div>
        <div className="col-span-5">评论内容 / AI 原因</div>
        <div className="col-span-2">文章 ID</div>
        <div className="col-span-2">状态</div>
        <div className="col-span-1 text-right">操作</div>
      </div>

      <div className="divide-y divide-border">
        {response.items.map((comment) => (
          <div
            key={comment.id}
            className="grid grid-cols-1 md:grid-cols-12 gap-6 px-6 py-8 hover:bg-accent/20 transition-colors group"
          >
            {/* Author & Time */}
            <div className="md:col-span-2 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-sm bg-muted flex items-center justify-center border border-border/50 overflow-hidden">
                  {comment.user?.image ? (
                    <img
                      src={comment.user.image}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[8px] font-mono">
                      {comment.user?.name.slice(0, 1)}
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium truncate">
                  {comment.user?.name}
                </span>
              </div>
              <div className="text-[10px] font-mono text-muted-foreground uppercase">
                {formatDate(comment.createdAt)}
              </div>
            </div>

            {/* Content & AI Reason */}
            <div className="md:col-span-5 space-y-3">
              <div className="prose prose-sm prose-zinc prose-invert max-w-none line-clamp-3">
                {renderCommentReact(comment.content as JSONContent)}
              </div>
              {comment.aiReason && (
                <div className="text-[10px] bg-orange-500/5 border border-orange-500/10 text-orange-500/80 p-2 rounded-sm italic">
                  AI: {comment.aiReason}
                </div>
              )}
            </div>

            {/* Post ID */}
            <div className="md:col-span-2 flex items-center">
              <span className="text-[11px] font-mono text-muted-foreground">
                #{comment.postId}
              </span>
            </div>

            {/* Status */}
            <div className="md:col-span-2 flex items-center">
              <StatusBadge status={comment.status} />
            </div>

            {/* Actions */}
            <div className="md:col-span-1">
              <CommentModerationActions
                commentId={comment.id}
                status={comment.status}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const variants: Record<string, string> = {
    published: "border-green-500/20 text-green-500 bg-green-500/5",
    pending: "border-orange-500/20 text-orange-500 bg-orange-500/5",
    verifying: "border-blue-500/20 text-blue-500 bg-blue-500/5",
    deleted: "border-destructive/20 text-destructive bg-destructive/5",
  };

  const labels: Record<string, string> = {
    published: "已发布",
    pending: "待审核",
    verifying: "审核中",
    deleted: "已拒绝",
  };

  return (
    <Badge
      variant="outline"
      className={`font-mono text-[9px] uppercase tracking-widest rounded-sm px-2 py-0.5 ${variants[status] || ""}`}
    >
      {labels[status] || status}
    </Badge>
  );
};
