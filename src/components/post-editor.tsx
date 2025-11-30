import { Editor } from "@/components/editor";
import {
  POST_STATUSES,
  type Post,
  type PostCategory,
  type PostStatus,
} from "@/db/schema";
import { CATEGORY_COLORS } from "@/lib/constants";
import { useRouter } from "@tanstack/react-router";
import type { JSONContent } from "@tiptap/react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileText,
  Layout,
  Link as LinkIcon,
  Loader2,
  RefreshCw,
  Save,
  Settings,
  Sparkles,
  Tag,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import DatePicker from "./ui/date-picker";

export interface PostEditorData {
  title: string;
  summary: string;
  slug: string;
  category: PostCategory;
  status: PostStatus;
  readTimeInMinutes: number;
  contentJson: JSONContent | null;
  publishedAt: Date | null;
}

interface PostEditorProps {
  mode: "new" | "edit";
  initialData?: Post;
  onSave: (data: PostEditorData) => Promise<void>;
}

const defaultData: PostEditorData = {
  title: "",
  summary: "",
  slug: "",
  category: "DEV",
  status: "draft",
  readTimeInMinutes: 1,
  contentJson: null,
  publishedAt: null,
};

export function PostEditor({ mode, initialData, onSave }: PostEditorProps) {
  const router = useRouter();
  const [post, setPost] = useState<PostEditorData>(() => {
    if (initialData) {
      return {
        title: initialData.title,
        summary: initialData.summary ?? "",
        slug: initialData.slug,
        category: initialData.category,
        status: initialData.status,
        readTimeInMinutes: initialData.readTimeInMinutes,
        contentJson: initialData.contentJson ?? null,
        publishedAt: initialData.publishedAt,
      };
    }
    return defaultData;
  });

  const [saveStatus, setSaveStatus] = useState<"SYNCED" | "SAVING" | "PENDING" | "ERROR">(
    "SYNCED"
  );
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isGeneratingSlug, setIsGeneratingSlug] = useState(false);
  const [isCalculatingReadTime, setIsCalculatingReadTime] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update post when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      setPost({
        title: initialData.title,
        summary: initialData.summary ?? "",
        slug: initialData.slug,
        category: initialData.category,
        status: initialData.status,
        readTimeInMinutes: initialData.readTimeInMinutes,
        contentJson: initialData.contentJson ?? null,
        publishedAt: initialData.publishedAt,
      });
    }
  }, [initialData]);

  // --- Auto-Save Logic (Edit mode only) ---
  const isFirstMount = useRef(true);
  const isSaving = useRef(false);

  useEffect(() => {
    // Skip auto-save for new posts (no ID yet)
    if (mode === "new") {
      setSaveStatus("PENDING");
      return;
    }

    // Skip first mount
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    // Skip if missing required fields
    if (!post.title.trim() || !post.slug.trim()) {
      setSaveStatus("PENDING");
      return;
    }

    setSaveStatus("SAVING");

    // Debounce the save operation
    const timer = setTimeout(async () => {
      if (isSaving.current) return;
      isSaving.current = true;

      try {
        setError(null);
        await onSave(post);
        setSaveStatus("SYNCED");
        setLastSaved(new Date());
      } catch (error) {
        console.error("Auto-save failed:", error);
        setSaveStatus("ERROR");
        setError("AUTO_SAVE_FAILED");
      } finally {
        isSaving.current = false;
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [post, onSave, mode]);

  // --- Manual Save (for new posts) ---
  const handleManualSave = async () => {
    if (!post.title.trim() || !post.slug.trim()) {
      alert("TITLE_AND_SLUG_REQUIRED");
      return;
    }

    setSaveStatus("SAVING");
    try {
      setError(null);
      await onSave(post);
      // Navigate to edit page after creating
      router.navigate({ to: "/admin/posts" });
    } catch (error) {
      console.error("Save failed:", error);
      setSaveStatus("ERROR");
      setError("MANUAL_SAVE_FAILED");
    }
  };

  const handleGenerateSlug = () => {
    setIsGeneratingSlug(true);
    setTimeout(() => {
      const generated = post.title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");

      setPost((prev) => ({ ...prev, slug: generated || "untitled-log" }));
      setIsGeneratingSlug(false);
    }, 400);
  };

  const handleCalculateReadTime = () => {
    if (!post.contentJson) return;
    setIsCalculatingReadTime(true);
    setTimeout(() => {
      // Extract text from JSON content
      const extractText = (node: JSONContent): string => {
        let text = "";
        if (node.text) text += node.text;
        if (node.content) {
          for (const child of node.content) {
            text += extractText(child) + " ";
          }
        }
        return text;
      };

      const words = extractText(post.contentJson!)
        .split(/\s+/)
        .filter(Boolean).length;
      const mins = Math.max(1, Math.ceil(words / 200));
      setPost((prev) => ({ ...prev, readTimeInMinutes: mins }));
      setIsCalculatingReadTime(false);
    }, 400);
  };

  const handleGenerateSummary = () => {
    setIsGeneratingSummary(true);
    // TODO: Replace with actual AI summary generation
    setTimeout(() => {
      const mockSummary =
        "AI_ANALYSIS_COMPLETE: Content analysis pending implementation. Summary will be auto-generated from post content.";
      setPost((prev) => ({ ...prev, summary: mockSummary }));
      setIsGeneratingSummary(false);
    }, 1500);
  };

  const handleContentChange = useCallback((json: JSONContent) => {
    setPost((prev) => ({ ...prev, contentJson: json }));
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] relative overflow-hidden bg-black">
      {/* --- Top Control Bar --- */}
      <div className="h-16 border-b border-zzz-gray bg-zzz-dark/80 backdrop-blur-md flex items-center justify-between px-6 z-40 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.history.back()}
            className="text-gray-500 hover:text-white transition-colors flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            <span className="font-mono text-xs hidden md:inline">
              RETURN_LOGS
            </span>
          </button>
          <div className="h-6 w-px bg-zzz-gray"></div>
          <div className="font-mono text-xs text-gray-500 uppercase">
            <span
              className={
                post.status === "published"
                  ? "text-zzz-lime"
                  : "text-zzz-orange"
              }
            >
              {post.status || "DRAFT"}
            </span>
            <span className="mx-2">//</span>
            <span>{mode === "new" ? "NEW_ENTRY" : initialData?.id}</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Sync Indicator */}
          <div className="flex items-center gap-2 font-mono text-[10px] tracking-widest uppercase">
            {saveStatus === "ERROR" ? (
              <>
                <X size={12} className="text-zzz-orange" />
                <span className="text-zzz-orange">{error}</span>
              </>
            ) : saveStatus === "SAVING" ? (
              <>
                <RefreshCw size={12} className="text-zzz-orange animate-spin" />
                <span className="text-zzz-orange">TRANSMITTING...</span>
              </>
            ) : saveStatus === "PENDING" ? (
              <>
                <div className="w-3 h-3 rounded-full bg-gray-500 animate-pulse" />
                <span className="text-gray-400">UNSAVED</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={12} className="text-zzz-lime" />
                <span className="text-zzz-lime">
                  SYNCED {lastSaved && `[${lastSaved.toLocaleTimeString()}]`}
                </span>
              </>
            )}
          </div>

          <div className="h-6 w-px bg-zzz-gray"></div>

          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase transition-colors border cursor-pointer ${
              isSettingsOpen
                ? "bg-zzz-gray text-white border-white"
                : "text-gray-400 border-transparent hover:text-white"
            }`}
          >
            <Settings size={16} />
            <span className="hidden md:inline">Config</span>
          </button>

          {/* Save Button (New mode only) */}
          {mode === "new" && (
            <button
              onClick={handleManualSave}
              disabled={saveStatus === "SAVING"}
              className="flex items-center gap-2 px-4 py-2 bg-zzz-lime text-black text-xs font-bold uppercase transition-colors hover:bg-white disabled:opacity-50"
            >
              {saveStatus === "SAVING" ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}
              CREATE
            </button>
          )}
        </div>
      </div>

      {/* --- Main Document Area (Centered WYSIWYG) --- */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative">
        <div className="w-full max-w-4xl mx-auto py-12 px-6 md:px-12 min-h-full bg-black">
          {/* Document Title (In-flow) */}
          <div className="mb-8 relative group">
            <input
              type="text"
              value={post.title}
              onChange={(e) => setPost({ ...post, title: e.target.value })}
              placeholder="ENTER TITLE..."
              className="w-full bg-transparent text-4xl md:text-6xl font-black font-sans uppercase text-white placeholder-gray-800 focus:outline-none border-l-4 border-transparent focus:border-zzz-lime pl-4 transition-all"
            />
            {/* Visual guide for title */}
            <div className="absolute -left-6 top-2 bottom-2 w-1 bg-zzz-gray/20 group-hover:bg-zzz-gray/50 transition-colors pointer-events-none"></div>
          </div>

          {/* The Editor */}
          <div className="min-h-[500px]">
            <Editor
              content={post.contentJson ?? ""}
              onChange={handleContentChange}
            />
          </div>

          {/* Bottom Spacer */}
          <div className="h-40 flex items-center justify-center opacity-30 pointer-events-none">
            <div className="h-1 w-20 bg-zzz-gray"></div>
          </div>
        </div>
      </div>

      {/* --- Settings Drawer (Slide-over) --- */}
      <div
        className={`fixed inset-y-0 right-0 w-80 bg-zzz-dark border-l border-zzz-gray shadow-[-20px_0_50px_rgba(0,0,0,0.5)] transform transition-transform duration-300 ease-out z-50 flex flex-col ${
          isSettingsOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-zzz-gray bg-zzz-black">
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-zzz-cyan uppercase">
            <Layout size={14} /> Entry_Config
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="text-gray-500 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {/* Status Selector */}
          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
              Post Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              {POST_STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => setPost({ ...post, status: s })}
                  className={`text-[10px] py-2 font-bold border uppercase cursor-pointer ${
                    post.status === s
                      ? "bg-zzz-lime text-black border-zzz-lime"
                      : "border-zzz-gray text-gray-400 hover:border-white"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Classification */}
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
                value={post.category}
                // @ts-ignore
                onChange={(e) => setPost({ ...post, category: e.target.value })}
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

          {/* Slug Field */}
          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center justify-between">
              <span>URL Slug</span>
              <button
                onClick={handleGenerateSlug}
                disabled={isGeneratingSlug}
                className={`transition-colors ${
                  isGeneratingSlug
                    ? "text-zzz-orange"
                    : "text-zzz-lime hover:text-white"
                }`}
                title="Generate Slug"
              >
                {isGeneratingSlug ? (
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
                value={post.slug || ""}
                onChange={(e) => setPost({ ...post, slug: e.target.value })}
                placeholder="post-url-slug"
                className={`w-full bg-black border text-white text-xs font-mono pl-9 pr-3 py-3 focus:outline-none placeholder-gray-700 transition-colors ${
                  isGeneratingSlug
                    ? "border-zzz-orange/50 text-gray-500"
                    : "border-zzz-gray focus:border-zzz-lime"
                }`}
                readOnly={isGeneratingSlug}
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                Publish Date
              </label>
              <DatePicker
                value={
                  post.publishedAt
                    ? post.publishedAt.toISOString().split("T")[0]
                    : ""
                }
                onChange={(dateStr) =>
                  setPost((prev) => ({
                    ...prev,
                    publishedAt: dateStr ? new Date(dateStr) : null,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center justify-between">
                <span>Read Time</span>
                <button
                  onClick={handleCalculateReadTime}
                  disabled={isCalculatingReadTime}
                  className={`transition-colors ${
                    isCalculatingReadTime
                      ? "text-zzz-orange"
                      : "text-zzz-lime hover:text-white"
                  }`}
                  title="Auto-Calculate"
                >
                  {isCalculatingReadTime ? (
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
                  value={post.readTimeInMinutes}
                  onChange={(e) =>
                    setPost({
                      ...post,
                      readTimeInMinutes: parseInt(e.target.value),
                    })
                  }
                  className={`w-full bg-black border text-white text-xs font-mono pl-9 pr-12 py-3 focus:outline-none ${
                    isCalculatingReadTime
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

          {/* Summary */}
          <div className="space-y-2 relative">
            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={12} /> Briefing
              </div>
              <button
                onClick={handleGenerateSummary}
                disabled={isGeneratingSummary}
                className={`transition-colors flex items-center gap-1 ${
                  isGeneratingSummary
                    ? "text-zzz-orange cursor-wait"
                    : "text-zzz-lime hover:text-white"
                }`}
                title="Generate Summary with AI"
              >
                {isGeneratingSummary ? (
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
                value={post.summary}
                onChange={(e) => setPost({ ...post, summary: e.target.value })}
                disabled={isGeneratingSummary}
                className={`w-full bg-black border text-gray-300 text-xs font-mono p-3 focus:outline-none resize-none h-32 leading-relaxed custom-scrollbar transition-all
                            ${
                              isGeneratingSummary
                                ? "border-zzz-orange/50 text-zzz-orange/70 bg-zzz-orange/5"
                                : "border-zzz-gray focus:border-zzz-cyan"
                            }
                        `}
                placeholder="Enter short description..."
              />
              {isGeneratingSummary && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="bg-black/80 border border-zzz-orange px-3 py-1 text-zzz-orange text-[10px] font-mono tracking-widest flex items-center gap-2">
                    <Sparkles size={10} className="animate-spin-slow" />{" "}
                    AI_GENERATING...
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-zzz-gray bg-black text-[10px] font-mono text-gray-600 text-center">
          SYSTEM_ID: {mode === "new" ? "PENDING" : initialData?.id}
        </div>
      </div>
    </div>
  );
}
