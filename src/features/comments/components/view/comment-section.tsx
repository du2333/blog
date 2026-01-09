import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { LogIn } from "lucide-react";
import { commentsByPostIdQuery } from "../../comments.query";
import { useComments } from "../../hooks/use-comments";
import { CommentList } from "./comment-list";
import { CommentEditor } from "./comment-editor";
import { authClient } from "@/lib/auth/auth.client";
import { Button } from "@/components/ui/button";
import ConfirmationModal from "@/components/ui/confirmation-modal";

interface CommentSectionProps {
  postId: number;
}

export const CommentSection = ({ postId }: CommentSectionProps) => {
  const { data: session } = authClient.useSession();
  const { data: response } = useSuspenseQuery(
    commentsByPostIdQuery(postId, session?.user.id),
  );
  const { createComment, deleteComment, isCreating, isDeleting } =
    useComments(postId);

  const [replyTarget, setReplyTarget] = useState<{
    id: number;
    userName: string;
  } | null>(null);

  const [commentToDelete, setCommentToDelete] = useState<number | null>(null);

  const handleCreateComment = async (content: any) => {
    await createComment({
      data: {
        postId,
        content,
      },
    });
  };

  const handleCreateReply = async (content: any) => {
    if (!replyTarget) return;
    await createComment({
      data: {
        postId,
        content,
        parentId: replyTarget.id,
      },
    });
    setReplyTarget(null);
  };

  const handleDelete = async () => {
    if (commentToDelete) {
      await deleteComment({ data: { id: commentToDelete } });
      setCommentToDelete(null);
    }
  };

  return (
    <section className="space-y-12 mt-32 pt-16 border-t border-border/50 animate-in fade-in duration-700">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-[11px] uppercase tracking-[0.4em] font-bold text-muted-foreground">
            评论交流
          </h3>
          <p className="text-2xl font-serif font-medium text-foreground">
            {response.total} 条评论
          </p>
        </div>
      </header>

      {/* Main Editor */}
      {session ? (
        <div className="space-y-6">
          <CommentEditor
            onSubmit={handleCreateComment}
            isSubmitting={isCreating && !replyTarget}
          />
        </div>
      ) : (
        <div className="py-12 px-8 border border-dashed border-border/50 rounded-sm bg-accent/5 flex flex-col items-center gap-6">
          <p className="text-sm text-muted-foreground text-center max-w-sm leading-relaxed">
            登录后即可发表评论，与博主和其他读者一起交流心得。
          </p>
          <Link to="/login">
            <Button
              variant="outline"
              className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] font-bold border-border hover:bg-foreground hover:text-background transition-all"
            >
              <LogIn size={14} className="mr-2" />
              立即登录
            </Button>
          </Link>
        </div>
      )}

      {/* Comments List */}
      <CommentList
        comments={response.items}
        onReply={(id, userName) => setReplyTarget({ id, userName })}
        onDelete={(id) => setCommentToDelete(id)}
        replyTarget={replyTarget}
        onCancelReply={() => setReplyTarget(null)}
        onSubmitReply={handleCreateReply}
        isSubmittingReply={isCreating}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!commentToDelete}
        onClose={() => setCommentToDelete(null)}
        onConfirm={handleDelete}
        title="删除评论"
        message="您确定要删除这条评论吗？如果是您本人的评论，删除后将显示为「该评论已删除」。"
        confirmLabel="确认删除"
        isDanger={true}
        isLoading={isDeleting}
      />
    </section>
  );
};
