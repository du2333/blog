import { Link, RouteApi } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MessageSquareOff,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { allCommentsQuery } from "../../comments.query";
import { useAdminComments } from "../../hooks/use-comments";

import { ExpandableContent } from "../view/expandable-content";
import { CommentModerationActions } from "./comment-moderation-actions";
import { UserHoverCard } from "./user-hover-card";
import type { CommentStatus } from "@/lib/db/schema";
import type { JSONContent } from "@tiptap/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDate } from "@/lib/utils";

interface CommentModerationTableProps {
  status?: CommentStatus;
  postId?: number;
  userName?: string;
  page?: number;
}

const PAGE_SIZE = 50;
const routeApi = new RouteApi({ id: "/admin/comments/" });

export const CommentModerationTable = ({
  status,
  postId,
  userName,
  page = 1,
}: CommentModerationTableProps) => {
  const navigate = routeApi.useNavigate();
  const { data: response, isLoading } = useQuery(
    allCommentsQuery({
      status,
      postId,
      userId: undefined, // userId is replaced by userName search
      userName,
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    }),
  );

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const { moderate } = useAdminComments();
  const queryClient = useQueryClient();

  const handleSelectAll = () => {
    if (!response) return;
    if (selectedIds.size === response.items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(response.items.map((item) => item.id)));
    }
  };

  const handleSelectOne = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBatchApprove = async () => {
    if (selectedIds.size === 0) return;
    const toastId = toast.loading(`正在批准 ${selectedIds.size} 条评论...`);
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) =>
          moderate({ data: { id, status: "published" } }),
        ),
      );
      toast.success("批量批准完成", { id: toastId });
      setSelectedIds(new Set());
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    } catch (error) {
      toast.error("部分操作失败", { id: toastId });
    }
  };

  const handleBatchTrash = async () => {
    if (selectedIds.size === 0) return;
    const toastId = toast.loading(
      `正在移入垃圾箱 ${selectedIds.size} 条评论...`,
    );
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) =>
          moderate({ data: { id, status: "deleted" } }),
        ),
      );
      toast.success("已移入垃圾箱", { id: toastId });
      setSelectedIds(new Set());
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    } catch (error) {
      toast.error("部分操作失败", { id: toastId });
    }
  };

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

  const allSelected =
    response.items.length > 0 && selectedIds.size === response.items.length;
  const totalPages = Math.ceil(response.total / PAGE_SIZE);

  return (
    <div className="space-y-4">
      {/* Batch Actions Toolbar */}
      {selectedIds.size > 0 && (
        <div className="sticky top-4 z-40 flex items-center justify-between p-4 bg-accent/90 backdrop-blur-md border border-border rounded-lg shadow-lg animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">
              已选择 {selectedIds.size} 项
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedIds(new Set())}
              className="h-8 text-xs bg-background/50"
            >
              取消选择
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleBatchApprove}
              className="h-8 bg-green-600 hover:bg-green-700 text-white border-none shadow-sm"
            >
              <Check size={14} className="mr-2" />
              批量通过
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleBatchTrash}
              className="h-8 shadow-sm text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200"
            >
              <Trash2 size={14} className="mr-2" />
              移入垃圾箱
            </Button>
          </div>
        </div>
      )}

      {/* Mobile Layout (Card View) - Visible on small screens */}
      <div className="md:hidden space-y-4">
        <div className="flex items-center justify-between px-2 pt-2">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={allSelected}
              onCheckedChange={handleSelectAll}
              aria-label="Select all"
            />
            <span className="text-sm font-medium text-muted-foreground">
              全选本页
            </span>
          </div>
        </div>
        {response.items.map((comment) => (
          <div
            key={comment.id}
            className={`bg-card border border-border rounded-lg p-4 space-y-4 ${selectedIds.has(comment.id) ? "border-primary/50 bg-accent/5" : ""}`}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectedIds.has(comment.id)}
                  onCheckedChange={() => handleSelectOne(comment.id)}
                />
                <UserHoverCard
                  user={{
                    id: comment.userId,
                    name: comment.user?.name || "Unknown",
                    image: comment.user?.image || null,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center border border-border overflow-hidden">
                      {comment.user?.image ? (
                        <img
                          src={comment.user.image}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-[10px] font-mono">
                          {comment.user?.name.slice(0, 1)}
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-medium">
                      {comment.user?.name}
                    </div>
                  </div>
                </UserHoverCard>
              </div>
              <StatusBadge status={comment.status} />
            </div>

            <div className="pl-7 space-y-3">
              <div className="text-xs text-muted-foreground font-mono">
                {formatDate(comment.createdAt)}
              </div>
              <ExpandableContent
                content={comment.content as JSONContent}
                maxLines={2}
                className="text-xs leading-relaxed"
              />

              <div className="flex flex-wrap gap-2 text-[10px] items-center text-muted-foreground/70 bg-muted/30 p-2 rounded-sm">
                {(comment as any).post && (
                  <Link
                    to="/post/$slug"
                    params={{ slug: (comment as any).post.slug || "" }}
                    className="font-mono hover:text-primary transition-colors truncate max-w-[200px] flex items-center gap-1"
                    title={(comment as any).post.title}
                  >
                    📄 {(comment as any).post.title}
                  </Link>
                )}
                {(comment as any).replyToUser && (
                  <span className="font-mono flex items-center gap-1">
                    ↪️ @{(comment as any).replyToUser.name}
                  </span>
                )}
              </div>
              {comment.aiReason && (
                <div className="text-[10px] bg-orange-500/5 border border-orange-500/10 text-orange-500/80 p-2 rounded-sm italic">
                  ⚠️ AI: {comment.aiReason}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-border/50">
              <CommentModerationActions
                commentId={comment.id}
                status={comment.status}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Layout (Table View) - Visible on medium+ screens */}
      {/* Removed overflow-hidden to allow hover cards to be fully visible */}
      <div className="hidden md:block border border-border rounded-lg bg-card shadow-sm">
        <div className="grid grid-cols-12 gap-4 px-6 py-3 text-[10px] uppercase tracking-[0.1em] text-muted-foreground font-bold border-b border-border bg-muted/40 items-center">
          <div className="col-span-1 flex items-center justify-center">
            <Checkbox
              checked={allSelected}
              onCheckedChange={handleSelectAll}
              aria-label="Select all"
            />
          </div>
          <div className="col-span-2">用户画像</div>
          <div className="col-span-4">评论内容 / 上下文</div>
          <div className="col-span-2">AI 审查</div>
          <div className="col-span-1">状态</div>
          <div className="col-span-2 text-right">操作</div>
        </div>

        <div className="divide-y divide-border/50">
          {response.items.map((comment) => (
            <div
              key={comment.id}
              className={`grid grid-cols-12 gap-4 px-6 py-4 hover:bg-accent/5 transition-colors group items-start ${
                selectedIds.has(comment.id) ? "bg-accent/10" : ""
              }`}
            >
              {/* Checkbox */}
              <div className="col-span-1 flex items-center justify-center pt-2">
                <Checkbox
                  checked={selectedIds.has(comment.id)}
                  onCheckedChange={() => handleSelectOne(comment.id)}
                />
              </div>

              {/* User Profile */}
              <div className="col-span-2 pt-1 relative">
                <UserHoverCard
                  user={{
                    id: comment.userId,
                    name: comment.user?.name || "Unknown",
                    image: comment.user?.image || null,
                  }}
                >
                  <div className="flex items-center gap-3 cursor-pointer group/user">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center border border-border overflow-hidden">
                      {comment.user?.image ? (
                        <img
                          src={comment.user.image}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-[9px] font-mono">
                          {comment.user?.name.slice(0, 1)}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-medium truncate group-hover/user:text-primary transition-colors">
                        {comment.user?.name}
                      </div>
                      <div className="text-[9px] font-mono text-muted-foreground uppercase truncate">
                        {formatDate(comment.createdAt)}
                      </div>
                    </div>
                  </div>
                </UserHoverCard>
              </div>

              {/* Content & Context */}
              <div className="col-span-4 space-y-2">
                <ExpandableContent
                  content={comment.content as JSONContent}
                  maxLines={2}
                  className="text-xs leading-relaxed"
                />

                {/* Context Info */}
                <div className="flex flex-wrap gap-2 text-[10px] items-center text-muted-foreground/70">
                  {(comment as any).post && (
                    <Link
                      to="/post/$slug"
                      params={{ slug: (comment as any).post.slug || "" }}
                      className="font-mono bg-muted px-1.5 py-0.5 rounded-[2px] truncate max-w-[150px] hover:text-primary hover:bg-primary/5 transition-colors cursor-pointer flex items-center gap-1.5"
                      title={(comment as any).post.title}
                    >
                      📄 {(comment as any).post.title}
                    </Link>
                  )}
                  {(comment as any).replyToUser && (
                    <span className="font-mono bg-muted px-1.5 py-0.5 rounded-[2px] hover:text-foreground cursor-default transition-colors">
                      ↪️ 回复 @{(comment as any).replyToUser.name}
                    </span>
                  )}
                </div>
              </div>

              {/* AI Reason */}
              <div className="col-span-2 pt-1">
                {comment.aiReason ? (
                  <div className="flex items-start gap-2 text-orange-500/90 bg-orange-500/5 p-2 rounded-sm border border-orange-500/10">
                    <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                    <span className="text-[10px] leading-tight font-medium">
                      {comment.aiReason}
                    </span>
                  </div>
                ) : (
                  <span className="text-[10px] text-muted-foreground/30 font-mono pl-2">
                    -
                  </span>
                )}
              </div>

              {/* Status */}
              <div className="col-span-1 pt-1">
                <StatusBadge status={comment.status} />
              </div>

              {/* Actions */}
              <div className="col-span-2 pt-0.5">
                <CommentModerationActions
                  commentId={comment.id}
                  status={comment.status}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 border-t border-border/50">
          <div className="text-xs text-muted-foreground">
            Displaying {(page - 1) * PAGE_SIZE + 1} -{" "}
            {Math.min(page * PAGE_SIZE, response.total)} of {response.total}{" "}
            comments
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() =>
                navigate({
                  search: (prev) => ({ ...prev, page: Math.max(1, page - 1) }),
                })
              }
            >
              <ChevronLeft size={16} />
              Prev
            </Button>
            <div className="text-xs font-medium px-4">
              Page {page} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() =>
                navigate({
                  search: (prev) => ({
                    ...prev,
                    page: Math.min(totalPages, page + 1),
                  }),
                })
              }
            >
              Next
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}
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
