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
    <div className="group px-4 sm:px-6 py-4 flex flex-col md:grid md:grid-cols-12 gap-4 items-center hover:bg-accent/50 transition-all duration-500 relative border-b border-border/40 last:border-0">
      {/* Main Content: Info Block */}
      <div
        className="md:col-span-6 min-w-0 cursor-pointer group/title w-full flex flex-col gap-1.5"
        onClick={handleEdit}
      >
        {/* Metadata Header: ID & Status */}
        <div className="flex items-center gap-3">
          <span className="font-mono text-muted-foreground text-[10px] tracking-widest opacity-50">
            #{post.id.toString().padStart(2, "0")}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-sans font-medium text-lg text-foreground tracking-tight group-hover/title:text-primary transition-colors duration-300 truncate">
          {post.title}
        </h3>

        {/* Summary */}
        <p className="text-xs text-muted-foreground truncate max-w-3xl font-light">
          {post.summary}
        </p>
      </div>

      {/* Middle side: Status & Info */}
      <div className="md:col-span-3 flex items-center gap-4">
        <StatusBadge status={post.status} />
      </div>

      {/* Right Side: Date & Actions */}
      <div className="md:col-span-3 flex md:justify-end items-center gap-6 w-full md:w-auto mt-2 md:mt-0">
        {/* Smart Date Display */}
        <div className="flex flex-col items-end gap-1">
          <div
            className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest cursor-help text-muted-foreground transition-colors hover:text-foreground"
            title={`发布于: ${post.publishedAt ? formatDate(post.publishedAt) : "未发布"}\n修改于: ${formatDate(post.updatedAt)}`}
          >
            {post.status === "published" ? (
              <Calendar
                size={10}
                strokeWidth={1.5}
                className="text-emerald-500"
              />
            ) : (
              <Edit3 size={10} strokeWidth={1.5} className="text-amber-500" />
            )}
            <span className="opacity-70">
              {post.status === "published" ? "发布于" : "修改于"}
            </span>
            <ClientOnly fallback={<span>-</span>}>
              {post.status === "published"
                ? formatDate(post.publishedAt || post.createdAt)
                : formatDate(post.updatedAt)}
            </ClientOnly>
          </div>
          <div
            className="flex items-center gap-2 text-[9px] font-mono uppercase tracking-tighter cursor-help text-muted-foreground/40 transition-colors hover:text-muted-foreground/60"
            title={`${post.status === "published" ? "更新于" : "创建于"}: ${formatDate(post.status === "published" ? post.updatedAt : post.createdAt)}`}
          >
            <span className="opacity-70 italic">
              {post.status === "published" ? "更新于" : "创建于"}
            </span>
            <ClientOnly fallback={<span>-</span>}>
              {formatDate(
                post.status === "published" ? post.updatedAt : post.createdAt,
              )}
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
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
            title="编辑"
          >
            <Edit3 size={14} strokeWidth={1.5} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
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
                className="h-8 w-8 text-muted-foreground"
              >
                <MoreVertical size={16} />
              </Button>
            }
            items={[
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
