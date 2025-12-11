import DatePicker from "@/components/ui/date-picker";
import TechButton from "@/components/ui/tech-button";
import { CATEGORY_COLORS } from "@/lib/constants";
import {
  POST_STATUSES,
  type PostCategory,
  type PostStatus,
} from "@/lib/db/schema";
import {
  Check,
  Clock,
  FileText,
  Layout,
  Link as LinkIcon,
  Loader2,
  Sparkles,
  Tag,
  X,
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
  postId,
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
    <div
      className={`fixed inset-y-0 right-0 w-80 bg-zzz-dark border-l border-zzz-gray shadow-[-20px_0_50px_rgba(0,0,0,0.5)] transform transition-transform duration-300 ease-out z-50 flex flex-col ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-zzz-gray bg-zzz-black">
        <div className="flex items-center gap-2 font-mono text-xs font-bold text-zzz-cyan uppercase">
          <Layout size={14} /> Entry_Config
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-white">
          <X size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
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
        <div className="md:hidden space-y-3 pt-4 border-t border-zzz-gray/30">
          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
            Mobile Actions
          </div>
          <TechButton
            variant={processState === "SUCCESS" ? "primary" : "secondary"}
            onClick={handleProcessData}
            disabled={processState !== "IDLE"}
            className="w-full justify-center"
            icon={processState === "SUCCESS" ? <Check size={14} /> : undefined}
          >
            {processState === "PROCESSING"
              ? "TRANSMITTING..."
              : processState === "SUCCESS"
              ? "WORKFLOW_QUEUED"
              : "RUN SYSTEM DIAGNOSTICS"}
          </TechButton>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-zzz-gray bg-black text-[10px] font-mono text-gray-600 text-center">
        BUFFER_ID: {postId}
      </div>
    </div>
  );
}

// --- Sub-components ---

function StatusSelector({
  value,
  onChange,
}: {
  value: PostStatus;
  onChange: (status: PostStatus) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
        Post Status
      </label>
      <div className="grid grid-cols-3 gap-2">
        {POST_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => onChange(s)}
            className={`text-[10px] py-2 font-bold border uppercase cursor-pointer ${
              value === s
                ? "bg-zzz-lime text-black border-zzz-lime"
                : "border-zzz-gray text-gray-400 hover:border-white"
            }`}
          >
            {s}
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
  return (
    <div className="space-y-2">
      <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
        Category
      </label>
      <div className="relative">
        <Tag
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          size={14}
        />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as PostCategory)}
          className="w-full bg-black border border-zzz-gray text-white text-xs font-mono pl-9 pr-3 py-3 focus:border-zzz-lime focus:outline-none appearance-none uppercase"
        >
          {Object.keys(CATEGORY_COLORS).map((c) => (
            <option key={c} value={c}>
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
    <div className="space-y-2">
      <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center justify-between">
        <span>URL Slug</span>
        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className={`transition-colors ${
            isGenerating ? "text-zzz-orange" : "text-zzz-lime hover:text-white"
          }`}
          title="Generate Slug"
        >
          {isGenerating ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Sparkles size={12} />
          )}
        </button>
      </label>
      <div className="relative">
        <LinkIcon
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          size={14}
        />
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="post-url-slug"
          className={`w-full bg-black border text-white text-xs font-mono pl-9 pr-3 py-3 focus:outline-none placeholder-gray-700 transition-colors ${
            isGenerating
              ? "border-zzz-orange/50 text-gray-500"
              : "border-zzz-gray focus:border-zzz-lime"
          }`}
          readOnly={isGenerating}
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
    <div className="grid grid-cols-1 gap-4">
      <div className="space-y-2">
        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
          Publish Date
        </label>
        <DatePicker
          value={publishedAt ? publishedAt.toISOString().split("T")[0] : ""}
          onChange={(dateStr) =>
            onDateChange(dateStr ? new Date(dateStr) : null)
          }
        />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center justify-between">
          <span>Read Time</span>
          <button
            onClick={onCalculateReadTime}
            disabled={isCalculating}
            className={`transition-colors ${
              isCalculating
                ? "text-zzz-orange"
                : "text-zzz-lime hover:text-white"
            }`}
            title="Auto-Calculate"
          >
            {isCalculating ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Sparkles size={12} />
            )}
          </button>
        </label>
        <div className="relative flex">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            <Clock size={14} />
          </div>
          <input
            type="number"
            min="1"
            value={readTimeInMinutes}
            onChange={(e) => onReadTimeChange(parseInt(e.target.value))}
            className={`w-full bg-black border text-white text-xs font-mono pl-9 pr-12 py-3 focus:outline-none ${
              isCalculating
                ? "border-zzz-orange/50"
                : "border-zzz-gray focus:border-zzz-lime"
            }`}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-500 pointer-events-none">
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
    <div className="space-y-2 relative">
      <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText size={12} /> Briefing
        </div>
        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className={`transition-colors flex items-center gap-1 ${
            isGenerating
              ? "text-zzz-orange cursor-wait"
              : "text-zzz-lime hover:text-white"
          }`}
          title="Generate Summary with AI"
        >
          {isGenerating ? (
            <>
              <span className="text-[9px] animate-pulse">PROCESSING</span>
              <Loader2 size={12} className="animate-spin" />
            </>
          ) : (
            <Sparkles size={12} />
          )}
        </button>
      </label>
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={isGenerating}
          className={`w-full bg-black border text-gray-300 text-xs font-mono p-3 focus:outline-none resize-none h-32 leading-relaxed custom-scrollbar transition-all ${
            isGenerating
              ? "border-zzz-orange/50 text-zzz-orange/70 bg-zzz-orange/5"
              : "border-zzz-gray focus:border-zzz-cyan"
          }`}
          placeholder="Enter short description..."
        />
        {isGenerating && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="bg-black/80 border border-zzz-orange px-3 py-1 text-zzz-orange text-[10px] font-mono tracking-widest flex items-center gap-2">
              <Sparkles size={10} className="animate-spin-slow" />{" "}
              AI_GENERATING...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
