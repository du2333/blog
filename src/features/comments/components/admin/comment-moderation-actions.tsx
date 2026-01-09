import { Check, Loader2, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useAdminComments } from "../../hooks/use-comments";
import { Button } from "@/components/ui/button";
import ConfirmationModal from "@/components/ui/confirmation-modal";

interface CommentModerationActionsProps {
  commentId: number;
  status: string;
}

export const CommentModerationActions = ({
  commentId,
  status,
}: CommentModerationActionsProps) => {
  const { moderate, adminDelete, isModerating, isAdminDeleting } =
    useAdminComments();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleApprove = async () => {
    await moderate({ data: { id: commentId, status: "published" } });
  };

  const handleReject = async () => {
    await moderate({ data: { id: commentId, status: "deleted" } });
  };

  const confirmDelete = async () => {
    await adminDelete({ data: { id: commentId } });
    setShowDeleteConfirm(false);
  };

  return (
    <div className="flex items-center justify-end gap-2">
      {status === "pending" || status === "verifying" ? (
        <>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleApprove}
            disabled={isModerating}
            className="h-8 w-8 text-green-500 hover:text-green-600 hover:bg-green-500/10"
            title="批准"
          >
            {isModerating ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Check size={16} />
            )}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleReject}
            disabled={isModerating}
            className="h-8 w-8 text-orange-500 hover:text-orange-600 hover:bg-orange-500/10"
            title="拒绝"
          >
            {isModerating ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <X size={16} />
            )}
          </Button>
        </>
      ) : null}

      <Button
        size="icon"
        variant="ghost"
        onClick={() => setShowDeleteConfirm(true)}
        disabled={isAdminDeleting}
        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
        title="永久删除"
      >
        {isAdminDeleting ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Trash2 size={16} />
        )}
      </Button>

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="永久删除评论"
        message="您确定要永久从数据库中删除这条评论吗？此操作无法撤销。"
        confirmLabel="确认永久删除"
        isDanger={true}
        isLoading={isAdminDeleting}
      />
    </div>
  );
};
