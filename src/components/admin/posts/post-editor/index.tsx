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
      />

      {/* Main Document Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative">
        <div className="w-full max-w-4xl mx-auto py-20 px-6 md:px-12 min-h-full">
          {/* Title Field (Auto-expanding Textarea) */}
          <div className="mb-16 group">
            <TextareaAutosize
              value={post.title}
              onChange={(e) => setPost({ ...post, title: e.target.value })}
              minRows={1}
              placeholder="输入标题"
              className="w-full bg-transparent text-5xl md:text-8xl font-serif font-medium tracking-tight text-zinc-950 dark:text-zinc-50 placeholder:text-zinc-100 dark:placeholder:text-zinc-900 focus:outline-none transition-all overflow-hidden leading-[1.05] resize-none border-none p-0"
            />
          </div>

          {/* Editor */}
          <div className="min-h-[600px] pb-32">
            <Editor
              content={post.contentJson ?? ""}
              onChange={handleContentChange}
            />
          </div>

          {/* Bottom Footer Decoration */}
          <div className="h-px w-full bg-zinc-100 dark:bg-white/5 mt-auto mb-20" />
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
