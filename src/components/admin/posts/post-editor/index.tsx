import { Editor } from "@/components/tiptap-editor";
import { useRouter, useBlocker } from "@tanstack/react-router";
import type { JSONContent } from "@tiptap/react";
import { useCallback, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { PostEditorSkeleton } from "@/components/skeletons/post-editor-skeleton";
import ConfirmationModal from "@/components/ui/confirmation-modal";

import { EditorToolbar, SettingsDrawer } from "./components";
import { useAutoSave, usePostActions } from "./hooks";
import { type PostEditorData, type PostEditorProps } from "./types";

// Re-export types for external use
export type { PostEditorData, PostEditorProps } from "./types";

export function PostEditor({ initialData, onSave }: PostEditorProps) {
  if (!initialData) return <PostEditorSkeleton />;
  const router = useRouter();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Initialize post state from initialData (always provided)
  const [post, setPost] = useState<PostEditorData>(() => ({
    title: initialData.title,
    summary: initialData.summary ?? "",
    slug: initialData.slug,
    category: initialData.category,
    status: initialData.status,
    readTimeInMinutes: initialData.readTimeInMinutes,
    contentJson: initialData.contentJson ?? null,
    publishedAt: initialData.publishedAt,
  }));

  // Auto-save hook - always enabled
  const { saveStatus, lastSaved, error, setError } = useAutoSave({
    post,
    onSave,
  });

  const { proceed, reset, status } = useBlocker({
    shouldBlockFn: () => saveStatus === "SAVING",
    withResolver: true,
  });

  // Post actions hook (slug, read time, summary)
  const {
    isGeneratingSlug,
    isCalculatingReadTime,
    isGeneratingSummary,
    handleGenerateSlug,
    handleCalculateReadTime,
    handleGenerateSummary,
    handleProcessData,
    processState,
  } = usePostActions({
    postId: initialData.id,
    post,
    setPost,
    setError,
  });

  // Content change handler
  const handleContentChange = useCallback((json: JSONContent) => {
    setPost((prev) => ({ ...prev, contentJson: json }));
  }, []);

  // Partial post update handler for settings drawer
  const handlePostChange = useCallback((updates: Partial<PostEditorData>) => {
    setPost((prev) => ({ ...prev, ...updates }));
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] relative overflow-hidden bg-white dark:bg-[#050505]">
      <ConfirmationModal
        isOpen={status === "blocked"}
        onClose={() => reset?.()}
        onConfirm={() => proceed?.()}
        title="离开页面？"
        message="您有正在保存的更改。离开可能会导致部分数据丢失。"
        confirmLabel="确认离开"
      />

      {/* Top Control Bar */}
      <EditorToolbar
        postId={initialData.id}
        status={post.status}
        saveStatus={saveStatus}
        lastSaved={lastSaved}
        error={error}
        isSettingsOpen={isSettingsOpen}
        onBack={() => router.history.back()}
        onToggleSettings={() => setIsSettingsOpen(!isSettingsOpen)}
        handleProcessData={handleProcessData}
        processState={processState}
        onViewPublic={() => {
          if (post.slug) {
            window.open(`/post/${post.slug}`, "_blank");
          }
        }}
      />

      {/* Main Document Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative">
        <div className="w-full max-w-5xl mx-auto py-24 px-8 md:px-16 min-h-full">
          {/* Title Field (Auto-expanding Textarea) */}
          <div className="mb-20 group">
            <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.5em] text-zinc-300 dark:text-zinc-700 font-bold mb-8">
              <span className="h-px w-12 bg-current opacity-30"></span>
              Headline
            </div>
            <TextareaAutosize
              value={post.title}
              onChange={(e) => setPost({ ...post, title: e.target.value })}
              minRows={1}
              placeholder="Start your story..."
              className="w-full bg-transparent text-6xl md:text-9xl font-serif font-medium tracking-tight text-zinc-950 dark:text-zinc-50 placeholder:text-zinc-100 dark:placeholder:text-zinc-900 focus:outline-none transition-all overflow-hidden leading-[0.95] resize-none border-none p-0"
            />
          </div>

          {/* Editor Container with higher focus */}
          <div className="min-h-[70vh] pb-40">
            <Editor
              content={post.contentJson ?? ""}
              onChange={handleContentChange}
            />
          </div>

          {/* Document Metadata Footer */}
          <div className="pt-12 border-t border-zinc-100 dark:border-white/5 mb-32 flex justify-between items-center text-[9px] font-mono text-zinc-400 uppercase tracking-[0.3em]">
            <div className="flex items-center gap-6">
              <span>Chars: {JSON.stringify(post.contentJson).length}</span>
              <span>Words: {Math.ceil(JSON.stringify(post.contentJson).length / 5)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500/20" />
              Document Secure
            </div>
          </div>
        </div>
      </div>

      {/* Settings Drawer */}
      <SettingsDrawer
        isOpen={isSettingsOpen}
        postId={initialData.id}
        post={post}
        isGeneratingSlug={isGeneratingSlug}
        isCalculatingReadTime={isCalculatingReadTime}
        isGeneratingSummary={isGeneratingSummary}
        onClose={() => setIsSettingsOpen(false)}
        onPostChange={handlePostChange}
        onGenerateSlug={handleGenerateSlug}
        onCalculateReadTime={handleCalculateReadTime}
        onGenerateSummary={handleGenerateSummary}
        handleProcessData={handleProcessData}
        processState={processState}
      />
    </div>
  );
}
