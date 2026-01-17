import { ClientOnly, useNavigate } from "@tanstack/react-router";
import { Edit3, MoreVertical, Trash2 } from "lucide-react";
import type { PostListItem } from "../types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Dropdown from "@/components/ui/dropdown";

import { formatDate } from "@/lib/utils";

interface PostRowProps {
  post: PostListItem;
  onDelete: (post: PostListItem) => void;
}

export function PostRow({ post, onDelete }: PostRowProps) {
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate({
      to: "/admin/posts/edit/$id",
      params: { id: String(post.id) },
    });
  };

  return (
    <div className="group px-4 py-4 flex flex-col md:grid md:grid-cols-12 gap-4 items-center hover:bg-muted/30 transition-all duration-200 relative border-b border-border/30 last:border-0">
      {/* Main Content: Info Block */}
      <div
        className="md:col-span-6 min-w-0 cursor-pointer group/title w-full flex flex-col gap-1"
        onClick={handleEdit}
      >
        {/* Metadata Header: ID */}
        <div className="flex items-center gap-3">
          <span className="font-mono text-muted-foreground text-[10px] tracking-widest">
            #{post.id.toString().padStart(3, "0")}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-serif font-medium text-lg text-foreground tracking-tight group-hover/title:underline underline-offset-4 decoration-border/50 transition-all truncate">
          {post.title}
        </h3>

        {/* Summary */}
        <p className="text-xs text-muted-foreground truncate max-w-3xl font-mono opacity-70">
          {post.summary || "无摘要"}
        </p>
      </div>

      {/* Middle side: Status */}
      <div className="md:col-span-3 flex items-center gap-4">
        <StatusBadge status={post.status} />
      </div>

      {/* Right Side: Date & Actions */}
      <div className="md:col-span-3 flex md:justify-end items-center gap-6 w-full md:w-auto mt-2 md:mt-0">
        {/* Smart Date Display */}
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            <span className="opacity-50">
              {post.status === "published" ? "发布" : "修改"}
            </span>
            <ClientOnly fallback={<span>-</span>}>
              {post.status === "published"
                ? formatDate(post.publishedAt || post.createdAt)
                : formatDate(post.updatedAt)}
            </ClientOnly>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-200 ml-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit();
            }}
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-transparent rounded-none"
            title="编辑"
          >
            <Edit3 size={14} strokeWidth={1.5} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-transparent rounded-none"
            title="删除"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(post);
            }}
          >
            <Trash2 size={14} strokeWidth={1.5} />
          </Button>
        </div>

        {/* Mobile Dropdown (Hidden on Desktop) */}
        <div className="md:hidden ml-auto">
          <Dropdown
            trigger={
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground rounded-none"
              >
                <MoreVertical size={16} />
              </Button>
            }
            items={[
              {
                label: "删除文章",
                icon: <Trash2 size={14} strokeWidth={1.5} />,
                onClick: () => onDelete(post),
                danger: true,
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={
        "text-[9px] px-2 py-0.5 uppercase tracking-widest font-mono font-normal rounded-none border border-border/50 shadow-none bg-transparent " +
        (status === "published"
          ? "text-emerald-600 border-emerald-500/30"
          : status === "draft"
            ? "text-muted-foreground border-border"
            : "text-amber-600 border-amber-500/30")
      }
    >
      {status === "published"
        ? "[ 已发布 ]"
        : status === "draft"
          ? "[ 草稿 ]"
          : "[ 待定 ]"}
    </Badge>
  );
}
