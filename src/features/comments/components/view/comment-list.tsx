import { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, LogIn } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { repliesByRootIdInfiniteQuery } from "../../comments.query";
import { CommentItem } from "./comment-item";
import { CommentReplyForm } from "./comment-reply-form";
import type { RootCommentWithReplyCount } from "../../comments.schema";
import type { JSONContent } from "@tiptap/react";
import { authClient } from "@/lib/auth/auth.client";
import { Button } from "@/components/ui/button";

// Alias for local use
type RootCommentWithUser = RootCommentWithReplyCount;

interface CommentListProps {
  rootComments: Array<RootCommentWithUser>;
  postId: number;
  onReply?: (rootId: number, commentId: number, userName: string) => void;
  onDelete?: (commentId: number) => void;
  replyTarget?: { rootId: number; commentId: number; userName: string } | null;
  onCancelReply?: () => void;
  onSubmitReply?: (content: JSONContent) => Promise<void>;
  isSubmittingReply?: boolean;
}

export const CommentList = ({
  rootComments,
  postId,
  onReply,
  onDelete,
  replyTarget,
  onCancelReply,
  onSubmitReply,
  isSubmittingReply,
}: CommentListProps) => {
  const { data: session } = authClient.useSession();
  const [expandedRoots, setExpandedRoots] = useState<Set<number>>(new Set());

  const toggleExpand = (rootId: number) => {
    setExpandedRoots((prev) => {
      const next = new Set(prev);
      if (next.has(rootId)) {
        next.delete(rootId);
      } else {
        next.add(rootId);
      }
      return next;
    });
  };

  if (rootComments.length === 0) {
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
      {rootComments.map((root) => (
        <RootCommentWithReplies
          key={root.id}
          root={root}
          postId={postId}
          isExpanded={expandedRoots.has(root.id)}
          onToggleExpand={() => toggleExpand(root.id)}
          onReply={onReply}
          onDelete={onDelete}
          replyTarget={replyTarget}
          onCancelReply={onCancelReply}
          onSubmitReply={onSubmitReply}
          isSubmittingReply={isSubmittingReply}
          session={session}
        />
      ))}
    </div>
  );
};

interface RootCommentWithRepliesProps {
  root: RootCommentWithUser;
  postId: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onReply?: (rootId: number, commentId: number, userName: string) => void;
  onDelete?: (commentId: number) => void;
  replyTarget?: { rootId: number; commentId: number; userName: string } | null;
  onCancelReply?: () => void;
  onSubmitReply?: (content: JSONContent) => Promise<void>;
  isSubmittingReply?: boolean;
  session: AuthContext["session"] | null;
}

function RootCommentWithReplies({
  root,
  postId,
  isExpanded,
  onToggleExpand,
  onReply,
  onDelete,
  replyTarget,
  onCancelReply,
  onSubmitReply,
  isSubmittingReply,
  session,
}: RootCommentWithRepliesProps) {
  const {
    data: repliesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(
    repliesByRootIdInfiniteQuery(postId, root.id, session?.user.id),
  );

  const allReplies = repliesData?.pages.flatMap((page) => page.items) ?? [];
  const isReplyingToRoot =
    replyTarget &&
    replyTarget.rootId === root.id &&
    replyTarget.commentId === root.id;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <CommentItem
        comment={root}
        onReply={() => {
          if (onReply) {
            onReply(root.id, root.id, root.user?.name || "未知用户");
          }
        }}
        onDelete={onDelete}
      />

      {isReplyingToRoot && (
        <div className="py-8 ml-12 px-6 border border-dashed border-border/50 rounded-sm bg-accent/5">
          {session ? (
            <CommentReplyForm
              parentUserName={replyTarget.userName}
              onSubmit={onSubmitReply!}
              isSubmitting={isSubmittingReply!}
              onCancel={onCancelReply!}
            />
          ) : (
            <div className="flex flex-col items-center gap-4 text-center">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">
                登录后即可发表评论，与博主和其他读者一起交流心得。
              </p>
              <div className="flex gap-4">
                <Link to="/login">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-4 text-[9px] uppercase tracking-widest font-bold border-border hover:bg-foreground hover:text-background transition-all"
                  >
                    <LogIn size={10} className="mr-2" />
                    立即登录
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onCancelReply}
                  className="h-8 px-4 text-[9px] uppercase tracking-widest font-bold text-muted-foreground hover:text-foreground"
                >
                  取消
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {root.replyCount > 0 && (
        <div className="ml-12 mt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleExpand}
            className="h-7 px-0 text-[10px] uppercase tracking-widest font-bold text-muted-foreground hover:text-foreground bg-transparent hover:bg-transparent"
          >
            {isExpanded ? (
              <>
                <ChevronUp size={12} className="mr-1.5" />
                收起回复 ({root.replyCount})
              </>
            ) : (
              <>
                <ChevronDown size={12} className="mr-1.5" />
                展开回复 ({root.replyCount})
              </>
            )}
          </Button>

          {isExpanded && (
            <div className="mt-4 space-y-2 border-l border-border/50 pl-6">
              {allReplies.map((reply) => {
                const isReplyingToThis =
                  replyTarget &&
                  replyTarget.rootId === root.id &&
                  replyTarget.commentId === reply.id;
                return (
                  <div key={reply.id}>
                    <CommentItem
                      comment={reply}
                      onReply={() => {
                        if (onReply) {
                          onReply(
                            root.id,
                            reply.id,
                            reply.replyTo?.name ||
                              reply.user?.name ||
                              "未知用户",
                          );
                        }
                      }}
                      onDelete={onDelete}
                      isReply
                      replyToName={reply.replyTo?.name}
                    />
                    {isReplyingToThis && (
                      <div className="py-8 ml-12 px-6 border border-dashed border-border/50 rounded-sm bg-accent/5">
                        {session ? (
                          <CommentReplyForm
                            parentUserName={replyTarget.userName}
                            onSubmit={onSubmitReply!}
                            isSubmitting={isSubmittingReply!}
                            onCancel={onCancelReply!}
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-4 text-center">
                            <p className="text-[11px] text-muted-foreground uppercase tracking-wider">
                              登录后即可发表评论，与博主和其他读者一起交流心得。
                            </p>
                            <div className="flex gap-4">
                              <Link to="/login">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 px-4 text-[9px] uppercase tracking-widest font-bold border-border hover:bg-foreground hover:text-background transition-all"
                                >
                                  <LogIn size={10} className="mr-2" />
                                  立即登录
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={onCancelReply}
                                className="h-8 px-4 text-[9px] uppercase tracking-widest font-bold text-muted-foreground hover:text-foreground"
                              >
                                取消
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {hasNextPage && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="h-7 px-0 text-[10px] uppercase tracking-widest font-bold text-muted-foreground hover:text-foreground bg-transparent hover:bg-transparent mt-2"
                >
                  {isFetchingNextPage ? "加载中..." : "加载更多回复"}
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
