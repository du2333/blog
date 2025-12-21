import DatePicker from "@/components/ui/date-picker";
import {
  POST_STATUSES,
  type PostCategory,
  type PostStatus,
} from "@/lib/db/schema";
import {
  Check,
  Clock,
  FileText,
  Link as LinkIcon,
  Loader2,
  Sparkles,
  Tag,
  X,
  Layout,
} from "lucide-react";
import type { PostEditorData } from "../types";

interface SettingsDrawerProps {
  isOpen: boolean;
  postId: number;
  post: PostEditorData;
  isGeneratingSlug: boolean;
  isCalculatingReadTime: boolean;
  isGeneratingSummary: boolean;
  onClose: () => void;
  onPostChange: (updates: Partial<PostEditorData>) => void;
  onGenerateSlug: () => void;
  onCalculateReadTime: () => void;
  onGenerateSummary: () => void;
  handleProcessData: () => void;
  processState: "IDLE" | "PROCESSING" | "SUCCESS";
}

export function SettingsDrawer({
  isOpen,
  post,
  isGeneratingSlug,
  isCalculatingReadTime,
  isGeneratingSummary,
  onClose,
  onPostChange,
  onGenerateSlug,
  onCalculateReadTime,
  onGenerateSummary,
  handleProcessData,
  processState,
}: SettingsDrawerProps) {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-sm z-[60] animate-in fade-in duration-500"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 right-0 w-full sm:w-96 bg-white dark:bg-[#0c0c0c] border-l border-zinc-100 dark:border-white/5 shadow-2xl transform transition-transform duration-700 ease-in-out z-[70] flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="h-20 flex items-center justify-between px-8 border-b border-zinc-100 dark:border-white/5">
          <div className="flex items-center gap-3">
            <Layout size={18} strokeWidth={1.5} className="text-zinc-400" />
            <span className="text-sm font-medium tracking-tight">文章设置</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
          <StatusSelector
            value={post.status}
            onChange={(status) => onPostChange({ status })}
          />

          <CategorySelector
            value={post.category}
            onChange={(category) => onPostChange({ category })}
          />

          <SlugField
            value={post.slug}
            isGenerating={isGeneratingSlug}
            onChange={(slug) => onPostChange({ slug })}
            onGenerate={onGenerateSlug}
          />

          <DateTimeFields
            publishedAt={post.publishedAt}
            readTimeInMinutes={post.readTimeInMinutes}
            isCalculating={isCalculatingReadTime}
            onDateChange={(publishedAt) => onPostChange({ publishedAt })}
            onReadTimeChange={(readTimeInMinutes) =>
              onPostChange({ readTimeInMinutes })
            }
            onCalculateReadTime={onCalculateReadTime}
          />

          <SummaryField
            value={post.summary}
            isGenerating={isGeneratingSummary}
            onChange={(summary) => onPostChange({ summary })}
            onGenerate={onGenerateSummary}
          />

          <div className="lg:hidden pt-6">
            <button
              onClick={handleProcessData}
              disabled={processState !== "IDLE"}
              className="w-full flex items-center justify-center gap-2 py-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[11px] uppercase tracking-[0.2em] font-bold transition-all disabled:opacity-50"
            >
              {processState === "PROCESSING" ? (
                <Loader2 size={14} className="animate-spin" />
              ) : processState === "SUCCESS" ? (
                <Check size={14} />
              ) : null}
              {processState === "PROCESSING"
                ? "处理中..."
                : processState === "SUCCESS"
                ? "已就绪"
                : "运行部署诊断"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function StatusSelector({
  value,
  onChange,
}: {
  value: PostStatus;
  onChange: (status: PostStatus) => void;
}) {
  return (
    <div className="space-y-4">
      <label className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 font-bold flex items-center gap-2">
        <div className="w-1 h-1 rounded-full bg-current" /> 发布状态
      </label>
      <div className="grid grid-cols-3 gap-2">
        {POST_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => onChange(s)}
            className={`py-3 text-[10px] uppercase tracking-[0.1em] font-medium transition-all rounded-sm border ${
              value === s
                ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-transparent"
                : "border-zinc-100 dark:border-white/5 text-zinc-400 hover:border-zinc-300 dark:hover:border-white/20"
            }`}
          >
            {s === "published" ? "已发布" : s === "draft" ? "草稿" : "计划中"}
          </button>
        ))}
      </div>
    </div>
  );
}

function CategorySelector({
  value,
  onChange,
}: {
  value: PostCategory;
  onChange: (category: PostCategory) => void;
}) {
  const categories = ["DEV", "DESIGN", "LIFE", "TECH"];
  return (
    <div className="space-y-4">
      <label className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 font-bold flex items-center gap-2">
        <div className="w-1 h-1 rounded-full bg-current" /> 分类
      </label>
      <div className="relative">
        <Tag
          className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 dark:text-zinc-700 pointer-events-none"
          size={14}
          strokeWidth={1.5}
        />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as PostCategory)}
          className="w-full bg-zinc-50 dark:bg-white/[0.03] border-none text-zinc-900 dark:text-zinc-100 text-xs font-medium pl-11 pr-4 py-4 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 rounded-sm appearance-none"
        >
          {categories.map((c) => (
            <option key={c} value={c} className="bg-white dark:bg-[#0c0c0c]">
              {c}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function SlugField({
  value,
  isGenerating,
  onChange,
  onGenerate,
}: {
  value: string;
  isGenerating: boolean;
  onChange: (slug: string) => void;
  onGenerate: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 font-bold flex items-center gap-2">
          <div className="w-1 h-1 rounded-full bg-current" /> URL 路径
        </label>
        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          title="自动生成"
        >
          {isGenerating ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Sparkles size={12} strokeWidth={1.5} />
          )}
        </button>
      </div>
      <div className="relative">
        <LinkIcon
          className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 dark:text-zinc-700"
          size={14}
          strokeWidth={1.5}
        />
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="post-url-slug"
          className="w-full bg-zinc-50 dark:bg-white/[0.03] border-none text-zinc-900 dark:text-zinc-100 text-xs font-mono pl-11 pr-4 py-4 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 rounded-sm placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
        />
      </div>
    </div>
  );
}

function DateTimeFields({
  publishedAt,
  readTimeInMinutes,
  isCalculating,
  onDateChange,
  onReadTimeChange,
  onCalculateReadTime,
}: {
  publishedAt: Date | null;
  readTimeInMinutes: number;
  isCalculating: boolean;
  onDateChange: (date: Date | null) => void;
  onReadTimeChange: (minutes: number) => void;
  onCalculateReadTime: () => void;
}) {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <label className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 font-bold flex items-center gap-2">
          <div className="w-1 h-1 rounded-full bg-current" /> 发布日期
        </label>
        <DatePicker
          value={publishedAt ? publishedAt.toISOString().split("T")[0] : ""}
          onChange={(dateStr) =>
            onDateChange(dateStr ? new Date(dateStr) : null)
          }
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 font-bold flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-current" /> 阅读时长
          </label>
          <button
            onClick={onCalculateReadTime}
            disabled={isCalculating}
            className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            title="自动计算"
          >
            {isCalculating ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Sparkles size={12} strokeWidth={1.5} />
            )}
          </button>
        </div>
        <div className="relative">
          <Clock
            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 dark:text-zinc-700"
            size={14}
            strokeWidth={1.5}
          />
          <input
            type="number"
            min="1"
            value={readTimeInMinutes}
            onChange={(e) => onReadTimeChange(parseInt(e.target.value))}
            className="w-full bg-zinc-50 dark:bg-white/[0.03] border-none text-zinc-900 dark:text-zinc-100 text-xs font-mono pl-11 pr-12 py-4 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 rounded-sm"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] uppercase tracking-widest font-bold text-zinc-300 dark:text-zinc-700 pointer-events-none">
            MIN
          </span>
        </div>
      </div>
    </div>
  );
}

function SummaryField({
  value,
  isGenerating,
  onChange,
  onGenerate,
}: {
  value: string;
  isGenerating: boolean;
  onChange: (summary: string) => void;
  onGenerate: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 font-bold flex items-center gap-2">
          <div className="w-1 h-1 rounded-full bg-current" /> 文章摘要
        </label>
        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className="flex items-center gap-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          title="AI 生成"
        >
          {isGenerating ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Sparkles size={12} strokeWidth={1.5} />
          )}
        </button>
      </div>
      <div className="relative">
        <FileText
          className="absolute left-4 top-4 text-zinc-300 dark:text-zinc-700"
          size={14}
          strokeWidth={1.5}
        />
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={isGenerating}
          className={`w-full bg-zinc-50 dark:bg-white/[0.03] border-none text-zinc-700 dark:text-zinc-300 text-xs leading-relaxed pl-11 pr-4 py-4 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 rounded-sm h-40 resize-none custom-scrollbar transition-all ${
            isGenerating ? "opacity-50" : ""
          }`}
          placeholder="输入文章简短摘要..."
        />
        {isGenerating && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white/80 dark:bg-black/80 px-4 py-2 rounded-sm border border-zinc-100 dark:border-white/10 text-[10px] uppercase tracking-widest font-bold flex items-center gap-2">
              <Sparkles size={12} className="animate-pulse" /> AI 分析中
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
