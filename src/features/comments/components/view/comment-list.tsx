import { Link } from "@tanstack/react-router";
import { LogIn } from "lucide-react";
import { useMemo } from "react";
import { CommentItem } from "./comment-item";
import { CommentReplyForm } from "./comment-reply-form";
import type { Comment } from "@/lib/db/schema";
import { authClient } from "@/lib/auth/auth.client";
import { Button } from "@/components/ui/button";

interface CommentWithUser extends Comment {
  user: {
    id: string;
    name: string;
    image: string | null;
    role: string | null;
  } | null;
}

interface CommentListProps {
  comments: Array<CommentWithUser>;
  onReply?: (commentId: number, userName: string) => void;
  onDelete?: (commentId: number) => void;
  replyTarget?: { id: number; userName: string } | null;
  onCancelReply?: () => void;
  onSubmitReply?: (content: any) => Promise<void>;
  isSubmittingReply?: boolean;
}

interface CommentNode extends CommentWithUser {
  replies: Array<CommentNode>;
}

export const CommentList = ({
  comments,
  onReply,
  onDelete,
  replyTarget,
  onCancelReply,
  onSubmitReply,
  isSubmittingReply,
}: CommentListProps) => {
  const { data: session } = authClient.useSession();

  const tree = useMemo(() => {
    const map = new Map<number, CommentNode>();
    const roots: Array<CommentNode> = [];

    // First pass: create nodes
    comments.forEach((c) => {
      map.set(c.id, { ...c, replies: [] });
    });

    // Second pass: link nodes
    comments.forEach((c) => {
      const node = map.get(c.id)!;
      if (c.parentId && map.has(c.parentId)) {
        map.get(c.parentId)!.replies.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }, [comments]);

  if (comments.length === 0) {
    return (
      <div className="py-20 text-center border-y border-border/30">
        <p className="text-[11px] uppercase tracking-[0.3em] font-mono text-muted-foreground">
          暂无评论，成为第一个评论的人吧
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border/30">
      {tree.map((node) => (
        <div
          key={node.id}
          className="animate-in fade-in slide-in-from-bottom-2 duration-500"
        >
          <CommentItem comment={node} onReply={onReply} onDelete={onDelete} />

          {replyTarget?.id === node.id && (
            <div className="py-4">
              {session ? (
                <CommentReplyForm
                  parentUserName={replyTarget.userName}
                  onSubmit={onSubmitReply!}
                  isSubmitting={isSubmittingReply!}
                  onCancel={onCancelReply!}
                  className="ml-12"
                />
              ) : (
                <div className="ml-12 p-6 border border-dashed border-border/50 rounded-sm bg-accent/5 flex flex-col items-center gap-4">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                    登录后回复 @{replyTarget.userName}
                  </p>
                  <Link to="/login">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 px-6 text-[10px] uppercase tracking-[0.2em] font-bold border-border hover:bg-foreground hover:text-background"
                    >
                      <LogIn size={12} className="mr-2" />
                      去登录
                    </Button>
                  </Link>
                  <button
                    onClick={onCancelReply}
                    className="text-[9px] uppercase tracking-widest text-muted-foreground hover:text-foreground underline underline-offset-4"
                  >
                    取消
                  </button>
                </div>
              )}
            </div>
          )}

          {node.replies.length > 0 && (
            <div className="space-y-2">
              {node.replies.map((reply) => (
                <div key={reply.id}>
                  <CommentItem
                    comment={reply}
                    onReply={onReply}
                    onDelete={onDelete}
                    isReply
                  />
                  {replyTarget?.id === reply.id && (
                    <div className="py-4">
                      {session ? (
                        <CommentReplyForm
                          parentUserName={replyTarget.userName}
                          onSubmit={onSubmitReply!}
                          isSubmitting={isSubmittingReply!}
                          onCancel={onCancelReply!}
                          className="ml-24"
                        />
                      ) : (
                        <div className="ml-24 p-6 border border-dashed border-border/50 rounded-sm bg-accent/5 flex flex-col items-center gap-4">
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                            登录后回复 @{replyTarget.userName}
                          </p>
                          <Link to="/login">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-9 px-6 text-[10px] uppercase tracking-[0.2em] font-bold border-border hover:bg-foreground hover:text-background"
                            >
                              <LogIn size={12} className="mr-2" />
                              去登录
                            </Button>
                          </Link>
                          <button
                            onClick={onCancelReply}
                            className="text-[9px] uppercase tracking-widest text-muted-foreground hover:text-foreground underline underline-offset-4"
                          >
                            取消
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
