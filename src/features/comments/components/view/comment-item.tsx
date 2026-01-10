import { memo, useMemo } from "react";
import { MessageSquare, Trash2 } from "lucide-react";
import { ExpandableContent } from "./expandable-content";
import { authClient } from "@/lib/auth/auth.client";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CommentItemProps {
  comment: {
    id: number;
    content: any;
    rootId: number | null;
    replyToCommentId: number | null;
    postId: number;
    userId: string;
    status: string;
    aiReason: string | null;
    createdAt: Date;
    updatedAt: Date;
    user: {
      id: string;
      name: string;
      image: string | null;
      role: string | null;
    } | null;
  };
  onReply?: (rootId: number, commentId: number, userName: string) => void;
  onDelete?: (commentId: number) => void;
  isReply?: boolean;
  replyToName?: string | null;
}

export const CommentItem = memo(
  ({ comment, onReply, onDelete, isReply, replyToName }: CommentItemProps) => {
    const { data: session } = authClient.useSession();
    const isAuthor = session?.user.id === comment.userId;
    const isAdmin = session?.user.role === "admin";
    const isBlogger = comment.user?.role === "admin";

    const renderedContent = useMemo(() => {
      if (comment.status === "deleted") {
        return (
          <p className="text-sm italic text-muted-foreground py-2">
            该评论已删除
          </p>
        );
      }
      return (
        <ExpandableContent
          content={comment.content}
          className="py-2"
          maxLines={6}
        />
      );
    }, [comment.content, comment.status]);

    return (
      <div
        className={`group flex gap-4 py-6 ${isReply ? "ml-12 border-l border-border/50 pl-6" : "border-b border-border/30"}`}
      >
        {/* Avatar */}
        <div className="shrink-0">
          <div className="w-10 h-10 rounded-sm bg-muted overflow-hidden flex items-center justify-center border border-border/50">
            {comment.user?.image ? (
              <img
                src={comment.user.image}
                alt={comment.user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs font-mono text-muted-foreground uppercase">
                {comment.user?.name.slice(0, 2) || "??"}
              </span>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isReply && replyToName && (
                <span className="text-xs text-muted-foreground">
                  回复{" "}
                  <span className="text-primary font-medium">
                    @{replyToName}
                  </span>
                </span>
              )}
              <span className="text-sm font-medium text-foreground">
                {comment.user?.name || "匿名用户"}
              </span>
              {isBlogger && (
                <Badge
                  variant="outline"
                  className="text-[9px] h-4 px-1.5 font-mono uppercase tracking-widest border-primary/30 text-primary bg-primary/5 rounded-sm"
                >
                  博主
                </Badge>
              )}
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                {formatDate(comment.createdAt)}
              </span>
            </div>
          </div>

          {renderedContent}

          {comment.status !== "deleted" && (
            <div className="flex items-center gap-4 pt-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const rootId = comment.rootId ?? comment.id;
                  onReply?.(
                    rootId,
                    comment.id,
                    comment.user?.name || "未知用户",
                  );
                }}
                className="h-7 px-0 text-[10px] uppercase tracking-widest font-bold text-muted-foreground hover:text-foreground bg-transparent hover:bg-transparent"
              >
                <MessageSquare size={12} className="mr-1.5" />
                回复
              </Button>

              {(isAuthor || isAdmin) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete?.(comment.id)}
                  className="h-7 px-0 text-[10px] uppercase tracking-widest font-bold text-muted-foreground hover:text-destructive bg-transparent hover:bg-transparent"
                >
                  <Trash2 size={12} className="mr-1.5" />
                  删除
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  },
);

CommentItem.displayName = "CommentItem";
