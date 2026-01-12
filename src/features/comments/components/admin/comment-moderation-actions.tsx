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
        <div className="absolute right-0 top-full mt-2 w-56 bg-background border border-border rounded-none shadow-2xl z-50 py-2 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-300">
          <div className="px-4 py-2 text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] border-b border-border/50 mb-2">
            状态管理
          </div>

          <div className="space-y-px">
            {status !== "published" && (
              <button
                onClick={() => handleStatusChange("published")}
                className="w-full flex items-center justify-between px-4 py-2.5 text-[11px] font-medium text-left hover:bg-muted transition-all text-foreground group"
              >
                <span>批准发布</span>
                <Check className="h-3 w-3 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            )}

            {status !== "pending" && (
              <button
                onClick={() => handleStatusChange("pending")}
                className="w-full flex items-center justify-between px-4 py-2.5 text-[11px] font-medium text-left hover:bg-muted transition-all text-foreground group"
              >
                <span>设为待审</span>
                <RotateCcw className="h-3 w-3 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            )}

            {status !== "deleted" && (
              <button
                onClick={() => handleStatusChange("deleted")}
                className="w-full flex items-center justify-between px-4 py-2.5 text-[11px] font-medium text-left hover:bg-muted transition-all text-orange-500 group"
              >
                <span>移入垃圾箱</span>
                <Trash2 className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            )}
          </div>

          <div className="h-px bg-border/50 my-2" />

          <button
            onClick={() => {
              setIsOpen(false);
              setShowDeleteConfirm(true);
            }}
            className="w-full flex items-center justify-between px-4 py-2.5 text-[11px] font-bold text-left hover:bg-destructive hover:text-white transition-all duration-300 text-destructive group"
          >
            <span>永久销毁</span>
            <ShieldAlert className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
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
