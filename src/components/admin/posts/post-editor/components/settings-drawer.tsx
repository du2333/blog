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
  Globe,
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
      <div
        className={`fixed inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm z-[60] transition-opacity duration-500 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 right-0 w-full sm:w-[450px] bg-white dark:bg-[#0c0c0c] border-l border-zinc-100 dark:border-white/5 shadow-2xl transform transition-transform duration-700 ease-in-out z-[70] flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="h-24 flex items-center justify-between px-10 border-b border-zinc-100 dark:border-white/5 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] font-bold text-zinc-400">
              <Layout size={12} strokeWidth={1.5} />
              <span>Metadata</span>
            </div>
            <h2 className="text-2xl font-serif font-medium text-zinc-950 dark:text-zinc-50">文章配置</h2>
          </div>
          <button
            onClick={onClose}
            className="p-3 -mr-3 text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors"
          >
            <X size={24} strokeWidth={1} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-10 space-y-14 custom-scrollbar">
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
              className="w-full flex items-center justify-center gap-3 py-5 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-[10px] uppercase tracking-[0.3em] font-bold transition-all disabled:opacity-20 shadow-xl shadow-black/10"
            >
              {processState === "PROCESSING" ? (
                <Loader2 size={16} className="animate-spin" />
              ) : processState === "SUCCESS" ? (
                <Check size={16} strokeWidth={3} />
              ) : null}
              <span>
                {processState === "PROCESSING"
                  ? "部署中"
                  : processState === "SUCCESS"
                  ? "部署成功"
                  : "启动全域部署"}
              </span>
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
    <div className="space-y-6">
      <label className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 font-bold flex items-center gap-3">
        <div className="w-1 h-1 rounded-full bg-current" /> 访问级别
      </label>
      <div className="flex gap-2 p-1 bg-zinc-50 dark:bg-white/[0.02] border border-zinc-100 dark:border-white/5 rounded-sm">
        {POST_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => onChange(s)}
            className={`flex-1 py-3 text-[10px] uppercase tracking-[0.1em] font-bold transition-all rounded-sm ${
              value === s
                ? "bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 shadow-sm"
                : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            }`}
          >
            {s === "published" ? "公开" : s === "draft" ? "草稿" : "预约"}
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
    <div className="space-y-6">
      <label className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 font-bold flex items-center gap-3">
        <div className="w-1 h-1 rounded-full bg-current" /> 内容分类
      </label>
      <div className="relative group">
        <Tag
          className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-300 dark:text-zinc-700 pointer-events-none group-focus-within:text-zinc-950 dark:group-focus-within:text-zinc-100 transition-colors"
          size={16}
          strokeWidth={1.5}
        />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as PostCategory)}
          className="w-full bg-transparent border-b border-zinc-100 dark:border-white/10 text-zinc-950 dark:text-zinc-50 text-sm font-light pl-8 pr-4 py-4 focus:outline-none focus:border-zinc-950 dark:focus:border-zinc-100 appearance-none cursor-pointer transition-all"
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <label className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 font-bold flex items-center gap-3">
          <div className="w-1 h-1 rounded-full bg-current" /> URL 标识
        </label>
        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className="text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors flex items-center gap-2 text-[9px] uppercase tracking-widest font-bold"
        >
          {isGenerating ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Sparkles size={12} strokeWidth={1.5} />
          )}
          <span>自动生成</span>
        </button>
      </div>
      <div className="relative group">
        <LinkIcon
          className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-300 dark:text-zinc-700 group-focus-within:text-zinc-950 dark:group-focus-within:text-zinc-100 transition-colors"
          size={16}
          strokeWidth={1.5}
        />
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="unique-article-slug"
          className="w-full bg-transparent border-b border-zinc-100 dark:border-white/10 text-zinc-950 dark:text-zinc-50 text-sm font-mono pl-8 pr-4 py-4 focus:outline-none focus:border-zinc-950 dark:focus:border-zinc-100 transition-all placeholder:text-zinc-200 dark:placeholder:text-zinc-800"
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
    <div className="space-y-12">
      <div className="space-y-6">
        <label className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 font-bold flex items-center gap-3">
          <div className="w-1 h-1 rounded-full bg-current" /> 发布时间线
        </label>
        <DatePicker
          value={publishedAt ? publishedAt.toISOString().split("T")[0] : ""}
          onChange={(dateStr) =>
            onDateChange(dateStr ? new Date(dateStr) : null)
          }
        />
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <label className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 font-bold flex items-center gap-3">
            <div className="w-1 h-1 rounded-full bg-current" /> 预计阅读
          </label>
          <button
            onClick={onCalculateReadTime}
            disabled={isCalculating}
            className="text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors flex items-center gap-2 text-[9px] uppercase tracking-widest font-bold"
          >
            {isCalculating ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Sparkles size={12} strokeWidth={1.5} />
            )}
            <span>智能计算</span>
          </button>
        </div>
        <div className="relative group">
          <Clock
            className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-300 dark:text-zinc-700 group-focus-within:text-zinc-950 dark:group-focus-within:text-zinc-100 transition-colors"
            size={16}
            strokeWidth={1.5}
          />
          <input
            type="number"
            min="1"
            value={readTimeInMinutes}
            onChange={(e) => onReadTimeChange(parseInt(e.target.value))}
            className="w-full bg-transparent border-b border-zinc-100 dark:border-white/10 text-zinc-950 dark:text-zinc-50 text-sm font-light pl-8 pr-12 py-4 focus:outline-none focus:border-zinc-950 dark:focus:border-zinc-100 transition-all"
          />
          <span className="absolute right-0 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-300 dark:text-zinc-700 uppercase tracking-widest pointer-events-none">
            Minutes
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <label className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 font-bold flex items-center gap-3">
          <div className="w-1 h-1 rounded-full bg-current" /> 内容摘要
        </label>
        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className="text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors flex items-center gap-2 text-[9px] uppercase tracking-widest font-bold"
        >
          {isGenerating ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Sparkles size={12} strokeWidth={1.5} />
          )}
          <span>AI 生成</span>
        </button>
      </div>
      <div className="relative group">
        <FileText
          className="absolute left-0 top-4 text-zinc-300 dark:text-zinc-700 group-focus-within:text-zinc-950 dark:group-focus-within:text-zinc-100 transition-colors"
          size={16}
          strokeWidth={1.5}
        />
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={isGenerating}
          className={`w-full bg-zinc-50/50 dark:bg-white/[0.01] border border-zinc-100 dark:border-white/5 text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed p-6 pl-10 focus:outline-none focus:border-zinc-950 dark:focus:border-zinc-100 rounded-sm h-48 resize-none custom-scrollbar transition-all ${
            isGenerating ? "opacity-50" : ""
          }`}
          placeholder="概括文章核心观点..."
        />
        {isGenerating && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white/95 dark:bg-black/95 px-6 py-3 rounded-sm border border-zinc-100 dark:border-white/10 text-[10px] uppercase tracking-widest font-bold flex items-center gap-3 shadow-2xl">
              <Sparkles size={14} className="animate-pulse text-zinc-950 dark:text-white" /> 
              <span>AI 分析中</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
