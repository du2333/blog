import { ClientOnly, useNavigate } from "@tanstack/react-router";
import { Calendar, Edit3, MoreVertical, Trash2 } from "lucide-react";
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
    <div className="group px-4 sm:px-6 py-6 sm:py-8 flex flex-col md:grid md:grid-cols-12 gap-4 sm:gap-6 items-start md:items-center hover:bg-accent/50 transition-all duration-500 relative">
      {/* ID & Status (Combined for mobile) */}
      <div className="md:col-span-1 flex items-center justify-between w-full md:block">
        <span className="font-mono text-muted-foreground text-[10px] tracking-widest">
          #{post.id}
        </span>
        <div className="md:hidden flex items-center gap-3">
          <StatusBadge status={post.status} />
          <Dropdown
            trigger={
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-zinc-400"
              >
                <MoreVertical size={18} />
              </Button>
            }
            items={[
              {
                label: "编辑",
                icon: <Edit3 size={14} strokeWidth={1.5} />,
                onClick: handleEdit,
              },
              {
                label: "删除",
                icon: <Trash2 size={14} strokeWidth={1.5} />,
                onClick: () => onDelete(post),
                danger: true,
              },
            ]}
          />
        </div>
      </div>

      {/* Title & Summary */}
      <div
        className="md:col-span-6 min-w-0 cursor-pointer group/title w-full"
        onClick={handleEdit}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
          <h3 className="font-serif text-xl sm:text-2xl leading-tight group-hover/title:translate-x-1 transition-transform duration-500 truncate min-w-0 flex-1">
            {post.title}
          </h3>
          <div className="hidden md:block shrink-0">
            <StatusBadge status={post.status} />
          </div>
        </div>
        <div className="text-xs text-muted-foreground font-normal truncate max-w-2xl">
          {post.summary}
        </div>
      </div>

      {/* Date (Responsive stacking) */}
      <div className="md:col-span-4 flex md:justify-end items-center gap-6 w-full text-zinc-400">
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest">
          <Calendar size={10} strokeWidth={1.5} className="opacity-40" />
          <ClientOnly fallback={<span>-</span>}>
            {formatDate(post.createdAt)}
          </ClientOnly>
        </div>
      </div>

      {/* Actions (Desktop: Hover, Mobile: Hidden) */}
      <div
        className="
        md:col-span-1 hidden md:flex items-center justify-end gap-3 w-full md:w-auto
        md:opacity-0 md:group-hover:opacity-100 md:translate-x-4 md:group-hover:translate-x-0 transition-all duration-500
      "
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={handleEdit}
          className="h-9 w-9 text-muted-foreground hover:text-foreground transition-colors"
          title="编辑"
        >
          <Edit3 size={18} strokeWidth={1.5} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-zinc-400 hover:text-red-500 transition-colors"
          title="删除"
          onClick={() => onDelete(post)}
        >
          <Trash2 size={18} strokeWidth={1.5} />
        </Button>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant={
        status === "published"
          ? "default"
          : status === "draft"
            ? "secondary"
            : "outline"
      }
      className={`
        text-[9px] px-2.5 py-0.5 uppercase tracking-[0.2em] font-bold rounded-sm border shadow-none
        ${
          status === "published"
            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/10"
            : status === "draft"
              ? "bg-zinc-500/10 text-zinc-500 border-zinc-500/20 hover:bg-zinc-500/10"
              : "bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/10"
        }
      `}
    >
      {status === "published"
        ? "已发布"
        : status === "draft"
          ? "草稿"
          : "计划中"}
    </Badge>
  );
}
