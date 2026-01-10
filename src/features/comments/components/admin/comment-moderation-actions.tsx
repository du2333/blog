import {
  Check,
  Loader2,
  MoreHorizontal,
  RotateCcw,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleStatusChange = async (
    newStatus: "published" | "pending" | "deleted",
  ) => {
    setIsOpen(false);
    await moderate({ data: { id: commentId, status: newStatus } });
  };

  const confirmDelete = async () => {
    await adminDelete({ data: { id: commentId } });
    setShowDeleteConfirm(false);
  };

  const isLoading = isModerating || isAdminDeleting;

  return (
    <div className="flex items-center justify-end relative" ref={menuRef}>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
        disabled={isLoading}
        onClick={() => setIsOpen(!isOpen)}
        title="更多操作"
      >
        {isLoading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <MoreHorizontal size={16} />
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-popover border border-border shadow-md rounded-md z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/50 mb-1">
            Change Status
          </div>

          {status !== "published" && (
            <button
              onClick={() => handleStatusChange("published")}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-left hover:bg-accent hover:text-accent-foreground transition-colors text-foreground"
            >
              <Check className="h-3.5 w-3.5 text-green-500" />
              <span>批准发布</span>
            </button>
          )}

          {status !== "pending" && (
            <button
              onClick={() => handleStatusChange("pending")}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-left hover:bg-accent hover:text-accent-foreground transition-colors text-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5 text-blue-500" />
              <span>重置为待审</span>
            </button>
          )}

          {status !== "deleted" && (
            <button
              onClick={() => handleStatusChange("deleted")}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-left hover:bg-accent hover:text-accent-foreground transition-colors text-foreground"
            >
              <Trash2 className="h-3.5 w-3.5 text-orange-500" />
              <span>移入垃圾箱 (软删)</span>
            </button>
          )}

          <div className="h-px bg-border/50 my-1" />

          <button
            onClick={() => {
              setIsOpen(false);
              setShowDeleteConfirm(true);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-left hover:bg-destructive/10 text-destructive transition-colors"
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>永久销毁 (Danger)</span>
          </button>
        </div>
      )}

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="永久删除确认"
        message="此操作将永久从数据库删除该评论，无法恢复！建议优先使用“移入垃圾箱”。"
        confirmLabel="确认销毁"
        isDanger={true}
        isLoading={isAdminDeleting}
      />
    </div>
  );
};
