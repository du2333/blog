import { useBlocker } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  Check,
  Clock,
  Cpu,
  Eye,
  EyeOff,
  FileText,
  Globe,
  Link as LinkIcon,
  Loader2,
  RefreshCw,
  Sparkles,
  Tag,
  X,
} from "lucide-react";
import { useCallback, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { useAutoSave, usePostActions } from "./hooks";
import type { JSONContent } from "@tiptap/react";
import type { PostEditorData, PostEditorProps } from "./types";
import { TagSelector } from "@/features/tags/components/tag-selector";
import { tagsAdminQueryOptions } from "@/features/tags/queries";
import { Editor } from "@/components/tiptap-editor";
import { Button } from "@/components/ui/button";
import ConfirmationModal from "@/components/ui/confirmation-modal";
import DatePicker from "@/components/ui/date-picker";

import { Input } from "@/components/ui/input";
import { POST_STATUSES } from "@/lib/db/schema";
import { extensions } from "@/features/posts/editor/config";
import { Breadcrumbs } from "@/components/breadcrumbs";

export function PostEditor({ initialData, onSave }: PostEditorProps) {
  // Initialize post state from initialData (always provided)
  const [post, setPost] = useState<PostEditorData>(() => ({
    title: initialData.title,
    summary: initialData.summary,
    slug: initialData.slug,
    status: initialData.status,
    readTimeInMinutes: initialData.readTimeInMinutes,
    contentJson: initialData.contentJson ?? null,
    publishedAt: initialData.publishedAt,
    tagIds: initialData.tagIds,
    isSynced: initialData.isSynced,
    hasPublicCache: initialData.hasPublicCache,
  }));

  // Sync state when initialData updates (e.g. after background refetch/invalidation)
  const [prevInitialDataId, setPrevInitialDataId] = useState(initialData.id);
  const [prevTagIds, setPrevTagIds] = useState(() =>
    [...initialData.tagIds].sort().join(","),
  );

  const currentTagIdsStr = [...initialData.tagIds].sort().join(",");

  if (prevInitialDataId !== initialData.id || prevTagIds !== currentTagIdsStr) {
    setPrevInitialDataId(initialData.id);
    setPrevTagIds(currentTagIdsStr);
    setPost((prev) => ({
      ...prev,
      tagIds: initialData.tagIds,
      isSynced: initialData.isSynced,
    }));
  }

  // Fetch all tags for AI context and matching
  const { data: allTags = [] } = useQuery(tagsAdminQueryOptions());

  // Auto-save hook
  const useAutoSaveReturn = useAutoSave({
    post,
    onSave,
  });

  const { saveStatus, lastSaved, setError } = useAutoSaveReturn;

  const { proceed, reset, status } = useBlocker({
    shouldBlockFn: () => saveStatus === "SAVING",
    withResolver: true,
  });

  // Post actions hook
  const {
    isGeneratingSlug,
    isCalculatingReadTime,
    isGeneratingSummary,
    handleGenerateSlug,
    handleCalculateReadTime,
    handleGenerateSummary,
    handleProcessData,
    processState,
    isGeneratingTags,
    handleGenerateTags,
    isDirty: isPostDirty,
  } = usePostActions({
    postId: initialData.id,
    post,
    initialData,
    setPost,
    setError,
    allTags,
  });

  const handleContentChange = useCallback((json: JSONContent) => {
    setPost((prev) => ({ ...prev, contentJson: json }));
  }, []);

  const handlePostChange = useCallback((updates: Partial<PostEditorData>) => {
    setPost((prev) => ({ ...prev, ...updates }));
  }, []);

  return (
    <div className="fixed inset-0 z-80 flex flex-col bg-background overflow-hidden">
      <ConfirmationModal
        isOpen={status === "blocked"}
        onClose={() => reset?.()}
        onConfirm={() => proceed?.()}
        title="离开页面？"
        message="您有正在保存的更改。离开可能会导致部分数据丢失。"
        confirmLabel="确认离开"
      />

      {/* Control Header */}
      <header className="min-h-16 md:h-20 flex items-center justify-between px-4 md:px-8 shrink-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50 gap-4">
        <div className="flex-1 min-w-0 overflow-hidden">
          <Breadcrumbs />
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => {
              if (post.slug) window.open(`/post/${post.slug}`, "_blank");
            }}
            disabled={!post.hasPublicCache}
            title={!post.hasPublicCache ? "前台暂无此文章" : "预览前台文章"}
            className="px-3 md:px-6 h-9 md:h-10 rounded-sm text-[10px] uppercase tracking-widest font-bold text-muted-foreground hover:text-foreground transition-all gap-2 group disabled:opacity-30"
          >
            <Eye
              size={14}
              className="group-hover:scale-110 transition-transform"
            />
            <span className="hidden md:inline">预览</span>
          </Button>

          <Button
            onClick={handleProcessData}
            disabled={
              processState !== "IDLE" || saveStatus === "SAVING" || !isPostDirty
            }
            title={
              !isPostDirty
                ? "内容已与前台同步"
                : !initialData.isSynced
                  ? "数据库已有待发布更新"
                  : "当前有未保存或未发布的改动"
            }
            className={`
              px-3 md:px-6 h-9 md:h-10 rounded-sm text-[10px] uppercase tracking-widest font-bold transition-all gap-2 shadow-lg shadow-black/5
              ${
                processState === "SUCCESS"
                  ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/10"
                  : post.status === "draft" && post.hasPublicCache
                    ? "bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-20"
                    : "bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-20"
              }
            `}
          >
            {processState === "PROCESSING" ? (
              <Loader2 size={14} className="animate-spin" />
            ) : processState === "SUCCESS" ? (
              <Check size={14} strokeWidth={3} />
            ) : post.status === "draft" && post.hasPublicCache ? (
              <EyeOff size={14} />
            ) : (
              <Cpu size={14} />
            )}
            <span className="hidden md:inline">
              {processState === "PROCESSING"
                ? post.status === "draft" && post.hasPublicCache
                  ? "下架中"
                  : "发布中"
                : processState === "SUCCESS"
                  ? post.status === "draft" && post.hasPublicCache
                    ? "已下架"
                    : "已发布"
                  : post.status === "draft" && post.hasPublicCache
                    ? "下架"
                    : "发布"}
            </span>
          </Button>
        </div>
      </header>

      {/* Main Content Area (Only this scrolls) */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative scroll-smooth animate-in fade-in slide-in-from-bottom-4 duration-1000 fill-mode-both delay-100">
        <div className="w-full max-w-3xl mx-auto py-20 px-6 md:px-0">
          {/* Title Area */}
          <div className="mb-12">
            <TextareaAutosize
              value={post.title}
              onChange={(e) =>
                setPost((prev) => ({ ...prev, title: e.target.value }))
              }
              minRows={1}
              placeholder="文章标题..."
              className="w-full bg-transparent text-5xl md:text-7xl font-serif font-medium tracking-tight text-foreground placeholder:text-muted/50 focus:outline-none transition-all overflow-hidden leading-[1.1] resize-none border-none p-0"
            />
          </div>

          {/* Notion-style Properties Section */}
          <div className="mb-20 space-y-1 py-8 border-y border-border/50">
            {/* Property Row: Status */}
            <div className="group flex items-center min-h-10 px-2 hover:bg-accent rounded-sm transition-colors">
              <div className="w-32 flex items-center gap-2 text-muted-foreground">
                <Globe size={14} strokeWidth={1.5} />
                <span className="text-[11px] uppercase tracking-wider font-medium">
                  状态
                </span>
              </div>
              <div className="flex-1 flex gap-2">
                {POST_STATUSES.map((s) => (
                  <Button
                    key={s}
                    variant={post.status === s ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handlePostChange({ status: s })}
                    className={`
                      px-3 h-7 text-[10px] uppercase tracking-wider font-bold rounded-sm transition-all
                      ${
                        post.status === s
                          ? ""
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      }
                    `}
                  >
                    {s === "published"
                      ? "公开"
                      : s === "draft"
                        ? "草稿"
                        : "归档"}
                  </Button>
                ))}
              </div>
            </div>

            {/* Property Row: Slug */}
            <div className="group flex items-center min-h-10 px-2 hover:bg-accent rounded-sm transition-colors">
              <div className="w-32 flex items-center gap-2 text-muted-foreground">
                <LinkIcon size={14} strokeWidth={1.5} />
                <span className="text-[11px] uppercase tracking-wider font-medium">
                  永久链接
                </span>
              </div>
              <div className="flex-1 flex items-center gap-2">
                <Input
                  type="text"
                  value={post.slug || ""}
                  onChange={(e) => handlePostChange({ slug: e.target.value })}
                  placeholder="文章链接..."
                  className="flex-1 bg-transparent border-none shadow-none text-xs font-mono text-foreground focus-visible:ring-0 placeholder:text-muted-foreground/30 px-0 h-auto"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleGenerateSlug}
                  disabled={isGeneratingSlug}
                  className="h-7 w-7 text-muted-foreground/50 hover:text-foreground opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all rounded-sm"
                  title="自动生成"
                >
                  {isGeneratingSlug ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Sparkles size={12} />
                  )}
                </Button>
              </div>
            </div>

            {/* Property Row: Tags */}
            <div className="group flex items-start py-3 px-2 hover:bg-accent rounded-sm transition-colors">
              <div className="w-32 flex items-center gap-2 text-muted-foreground pt-1">
                <Tag size={14} strokeWidth={1.5} />
                <span className="text-[11px] uppercase tracking-wider font-medium">
                  标签
                </span>
              </div>
              <div className="flex-1">
                <TagSelector
                  value={post.tagIds}
                  onChange={(tagIds) => handlePostChange({ tagIds })}
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleGenerateTags}
                disabled={isGeneratingTags}
                className="h-9 w-9 text-muted-foreground/50 hover:text-foreground opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all rounded-sm ml-2"
                title="AI 自动生成标签"
              >
                {isGeneratingTags ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Sparkles size={14} />
                )}
              </Button>
            </div>

            {/* Property Row: Date */}
            <div className="group flex items-center min-h-10 px-2 hover:bg-accent rounded-sm transition-colors">
              <div className="w-32 flex items-center gap-2 text-muted-foreground">
                <Calendar size={14} strokeWidth={1.5} />
                <span className="text-[11px] uppercase tracking-wider font-medium">
                  发布时间
                </span>
              </div>
              <div className="flex-1">
                <DatePicker
                  value={
                    post.publishedAt
                      ? post.publishedAt.toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(dateStr) =>
                    handlePostChange({
                      publishedAt: dateStr
                        ? new Date(`${dateStr}T00:00:00`)
                        : null,
                    })
                  }
                  className="p-0! border-none! bg-transparent! text-xs text-foreground"
                />
              </div>
            </div>

            {/* Property Row: Read Time */}
            <div className="group flex items-center min-h-10 px-2 hover:bg-accent rounded-sm transition-colors">
              <div className="w-32 flex items-center gap-2 text-muted-foreground">
                <Clock size={14} strokeWidth={1.5} />
                <span className="text-[11px] uppercase tracking-wider font-medium">
                  阅读时间
                </span>
              </div>
              <div className="flex-1 flex items-center gap-2">
                <Input
                  type="number"
                  value={post.readTimeInMinutes}
                  onChange={(e) =>
                    handlePostChange({
                      readTimeInMinutes: Number.parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-16 bg-transparent border-none shadow-none text-xs text-foreground focus-visible:ring-0 px-0 h-auto"
                />
                <span className="text-[10px] text-muted-foreground/50 uppercase tracking-widest font-bold">
                  分钟
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCalculateReadTime}
                  disabled={isCalculatingReadTime}
                  className="h-7 w-7 text-muted-foreground/50 hover:text-foreground opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all rounded-sm"
                  title="自动计算"
                >
                  {isCalculatingReadTime ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Sparkles size={12} />
                  )}
                </Button>
              </div>
            </div>

            {/* Property Row: Summary */}
            <div className="group flex items-start py-3 px-2 hover:bg-accent rounded-sm transition-colors">
              <div className="w-32 flex items-center gap-2 text-muted-foreground pt-1">
                <FileText size={14} strokeWidth={1.5} />
                <span className="text-[11px] uppercase tracking-wider font-medium">
                  摘要
                </span>
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <TextareaAutosize
                  value={post.summary || ""}
                  onChange={(e) =>
                    handlePostChange({ summary: e.target.value })
                  }
                  placeholder="简单介绍一下内容..."
                  className="w-full bg-transparent text-xs leading-relaxed text-foreground focus:outline-none resize-none placeholder:text-muted-foreground/30"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleGenerateSummary}
                  disabled={isGeneratingSummary}
                  className="w-fit h-7 px-3 bg-accent text-[9px] uppercase tracking-widest font-bold text-muted-foreground hover:text-foreground rounded-sm transition-all gap-2"
                >
                  {isGeneratingSummary ? (
                    <Loader2 size={10} className="animate-spin" />
                  ) : (
                    <Sparkles size={10} />
                  )}
                  <span>
                    {isGeneratingSummary ? "生成中..." : "AI 生成摘要"}
                  </span>
                </Button>
              </div>
            </div>
          </div>

          {/* Editor Area */}
          <div className="min-h-[60vh] pb-32">
            <Editor
              extensions={extensions}
              content={post.contentJson ?? ""}
              onChange={handleContentChange}
            />
          </div>
        </div>
      </div>

      {/* Floating Status Bar (Bottom Right) */}
      <div className="fixed bottom-8 right-8 z-40 flex items-center gap-4 px-6 py-3 bg-background/80 backdrop-blur-md border border-border/50 rounded-sm shadow-2xl">
        <div className="flex items-center gap-4 border-r border-border/50 pr-4 text-[10px] font-medium text-muted-foreground">
          <div className="flex items-center gap-1">
            <span className="text-foreground">
              {JSON.stringify(post.contentJson || "").length}
            </span>
            <span className="opacity-40">字符</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-foreground">
              {Math.ceil(JSON.stringify(post.contentJson || "").length / 5)}
            </span>
            <span className="opacity-40">单词</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
          {saveStatus === "ERROR" ? (
            <div className="flex items-center gap-2 text-red-500">
              <X size={14} />
              <span>错误</span>
            </div>
          ) : saveStatus === "SAVING" ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <RefreshCw size={14} className="animate-spin" />
              <span>正在保存</span>
            </div>
          ) : saveStatus === "PENDING" ? (
            <div className="flex items-center gap-2 text-amber-500">
              <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              <span>已修改</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground/30">
              <Check size={14} strokeWidth={3} />
              <span className="opacity-50">
                {lastSaved
                  ? lastSaved.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "已同步"}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
