import { Link, RouteApi } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Loader2, MessageSquareOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { COMMENTS_KEYS, allCommentsQuery } from "../../queries";
import { useAdminComments } from "../../hooks/use-comments";

import { ExpandableContent } from "../view/expandable-content";
import { CommentModerationActions } from "./comment-moderation-actions";
import { UserHoverCard } from "./user-hover-card";
import type { JSONContent } from "@tiptap/react";
import type { CommentStatus } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { formatDate } from "@/lib/utils";

interface CommentModerationTableProps {
  status?: CommentStatus;
  postId?: number;
  userName?: string;
  page?: number;
}

const PAGE_SIZE = 20;
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
      queryClient.invalidateQueries({ queryKey: COMMENTS_KEYS.all });
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
      queryClient.invalidateQueries({ queryKey: COMMENTS_KEYS.all });
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
    <div className="space-y-6">
      {/* Batch Actions Toolbar */}
      {selectedIds.size > 0 && (
        <div className="sticky top-4 z-40 flex items-center justify-between p-5 bg-background border border-border rounded-none shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-6">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
              已选择 / {selectedIds.size}
            </span>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
            >
              取消选择
            </button>
          </div>
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              onClick={handleBatchApprove}
              className="h-9 px-6 rounded-none bg-foreground text-background hover:bg-foreground/90 transition-all font-bold text-[10px] uppercase tracking-widest"
            >
              批量批准
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleBatchTrash}
              className="h-9 px-6 rounded-none border-border hover:bg-muted transition-all font-bold text-[10px] uppercase tracking-widest"
            >
              移入垃圾箱
            </Button>
          </div>
        </div>
      )}

      {/* List Header (Desktop) */}
      <div className="hidden md:grid grid-cols-12 gap-8 px-8 py-4 border-b border-border/50 items-center">
        <div className="col-span-1 flex justify-center">
          <Checkbox
            checked={allSelected}
            onCheckedChange={handleSelectAll}
            className="rounded-none border-border"
          />
        </div>
        <div className="col-span-2 text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
          作者
        </div>
        <div className="col-span-1"></div>
        <div className="col-span-5 text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
          评论内容 / 上下文
        </div>
        <div className="col-span-1 text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
          状态
        </div>
        <div className="col-span-2 text-right text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
          操作
        </div>
      </div>

      {/* Comments List */}
      <div className="divide-y divide-border/30">
        {response.items.map((comment) => (
          <div
            key={comment.id}
            className={`
              group transition-all duration-500
              ${selectedIds.has(comment.id) ? "bg-muted/30" : "hover:bg-muted/10"}
            `}
          >
            {/* Desktop Item */}
            <div className="hidden md:grid grid-cols-12 gap-8 px-8 py-8 items-start">
              <div className="col-span-1 flex justify-center pt-2">
                <Checkbox
                  checked={selectedIds.has(comment.id)}
                  onCheckedChange={() => handleSelectOne(comment.id)}
                  className="rounded-none border-border"
                />
              </div>

              {/* Author Info */}
              <div className="col-span-2 space-y-3">
                <UserHoverCard
                  user={{
                    id: comment.userId,
                    name: comment.user?.name || "Unknown",
                    image: comment.user?.image || null,
                  }}
                >
                  <div className="flex items-center gap-3 cursor-pointer group/user overflow-hidden">
                    <div className="w-10 h-10 rounded-none bg-muted flex items-center justify-center border border-border shrink-0 grayscale hover:grayscale-0 transition-all duration-700">
                      {comment.user?.image ? (
                        <img
                          src={comment.user.image}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-[10px] font-mono font-bold">
                          {comment.user?.name.slice(0, 1)}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[13px] font-bold truncate group-hover/user:text-primary transition-colors tracking-tight">
                        {comment.user?.name}
                      </div>
                      <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest mt-0.5">
                        {formatDate(comment.createdAt).split(" ")[0]}
                      </div>
                    </div>
                  </div>
                </UserHoverCard>
              </div>

              <div className="col-span-1"></div>

              {/* Content & Context */}
              <div className="col-span-5 space-y-4">
                <div className="relative">
                  <ExpandableContent
                    content={comment.content as JSONContent}
                    maxLines={3}
                    className="text-[14px] leading-[1.6] text-foreground/90 font-sans tracking-normal"
                  />
                </div>

                {/* Context & Meta */}
                <div className="flex flex-col gap-2 border-l border-border/50 pl-4 py-1">
                  {comment.post && (
                    <Link
                      to="/post/$slug"
                      params={{ slug: comment.post.slug || "" }}
                      hash={`comment-${comment.id}`}
                      search={{
                        highlightCommentId: comment.id,
                        rootId: comment.rootId || undefined,
                      }}
                      className="text-[10px] font-mono text-muted-foreground hover:text-foreground transition-all flex items-center gap-2 group/post"
                    >
                      <span className="opacity-30 group-hover/post:opacity-100 transition-opacity">
                        跳至评论 /
                      </span>
                      <span className="truncate max-w-[200px]">
                        {comment.post.title}
                      </span>
                    </Link>
                  )}
                  {comment.replyToUser && (
                    <div className="text-[10px] font-mono text-muted-foreground flex items-center gap-2">
                      <span className="opacity-30">回复 /</span>
                      <span>@{comment.replyToUser.name}</span>
                    </div>
                  )}
                  {comment.aiReason && (
                    <div className="text-[10px] font-serif italic text-orange-600/80 flex items-center gap-2 bg-orange-500/5 px-2 py-1 self-start">
                      <AlertTriangle size={10} />
                      <span>{comment.aiReason}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="col-span-1 pt-1">
                <StatusBadge status={comment.status} />
              </div>

              {/* Actions */}
              <div className="col-span-2 flex justify-end">
                <CommentModerationActions
                  commentId={comment.id}
                  status={comment.status}
                />
              </div>
            </div>

            {/* Mobile Item */}
            <div className="md:hidden p-6 space-y-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <Checkbox
                    checked={selectedIds.has(comment.id)}
                    onCheckedChange={() => handleSelectOne(comment.id)}
                    className="rounded-none border-border"
                  />
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-none bg-muted flex items-center justify-center border border-border shrink-0 grayscale">
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
                    <div>
                      <div className="text-xs font-bold font-serif tracking-tight">
                        {comment.user?.name}
                      </div>
                      <div className="text-[9px] font-mono text-muted-foreground uppercase">
                        {formatDate(comment.createdAt).split(" ")[0]}
                      </div>
                    </div>
                  </div>
                </div>
                <StatusBadge status={comment.status} />
              </div>

              <ExpandableContent
                content={comment.content as JSONContent}
                maxLines={3}
                className="text-sm leading-relaxed"
              />

              <div className="flex flex-col gap-2 text-[10px] font-mono text-muted-foreground bg-muted/20 p-3">
                {comment.post && (
                  <Link
                    to="/post/$slug"
                    params={{ slug: comment.post.slug || "" }}
                    hash={`comment-${comment.id}`}
                    search={{
                      highlightCommentId: comment.id,
                      rootId: comment.rootId || undefined,
                    }}
                    className="truncate hover:text-foreground transition-colors"
                  >
                    <span className="opacity-40">跳至评论 / </span>
                    {comment.post.title}
                  </Link>
                )}
                {comment.replyToUser && (
                  <div>
                    <span className="opacity-40">回复 / </span>@
                    {comment.replyToUser.name}
                  </div>
                )}
                {comment.aiReason && (
                  <div className="text-[10px] font-serif italic text-orange-600/80 flex items-center gap-2 pt-1">
                    <AlertTriangle size={10} />
                    <span>{comment.aiReason}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4 border-t border-border/30">
                <CommentModerationActions
                  commentId={comment.id}
                  status={comment.status}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Container */}
      <div className="pt-12 px-2 border-t border-border/30">
        <AdminPagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={response.total}
          itemsPerPage={PAGE_SIZE}
          currentPageItemCount={response.items.length}
          onPageChange={(newPage) =>
            navigate({
              search: (prev) => ({ ...prev, page: newPage }),
            })
          }
        />
      </div>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const variants: Record<string, string> = {
    published: "text-foreground",
    pending: "text-orange-500",
    verifying: "text-blue-500 font-serif italic",
    deleted: "text-muted-foreground line-through opacity-50",
  };

  const labels: Record<string, string> = {
    published: "已发布",
    pending: "待审核",
    verifying: "识别中",
    deleted: "垃圾箱",
  };

  return (
    <div
      className={`font-mono text-[9px] font-bold uppercase tracking-[0.2em] relative inline-flex items-center gap-2 ${variants[status] || ""}`}
    >
      <span
        className={`w-1 h-1 rounded-full ${status === "published" ? "bg-green-500" : status === "pending" ? "bg-orange-500" : status === "verifying" ? "bg-blue-500" : "bg-muted-foreground"}`}
      ></span>
      {labels[status] || status}
    </div>
  );
};
