import { Editor } from "@/components/tiptap-editor";
import { useRouter, useBlocker } from "@tanstack/react-router";
import type { JSONContent } from "@tiptap/react";
import { useCallback, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import ConfirmationModal from "@/components/ui/confirmation-modal";

import { EditorToolbar, SettingsDrawer } from "./components";
import { useAutoSave, usePostActions } from "./hooks";
import { type PostEditorData, type PostEditorProps } from "./types";

// Re-export types for external use
export type { PostEditorData, PostEditorProps } from "./types";

export function PostEditor({ initialData, onSave }: PostEditorProps) {
  if (!initialData) return null;
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
    <div className="flex flex-col h-[calc(100vh-4rem)] relative overflow-hidden bg-black">
      <ConfirmationModal
        isOpen={status === "blocked"}
        onClose={() => reset?.()}
        onConfirm={() => proceed?.()}
        title="未保存的更改"
        message="你确定要离开吗？你将丢失所有未保存的更改。"
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
        <div className="w-full max-w-4xl mx-auto py-12 px-6 md:px-12 min-h-full bg-black">
          {/* Title Field (Auto-expanding Textarea) */}
          <div className="mb-8 relative group">
            <TextareaAutosize
              value={post.title}
              onChange={(e) => setPost({ ...post, title: e.target.value })}
              minRows={1}
              placeholder="UNTITLED_LOG..."
              className="w-full bg-transparent text-4xl md:text-6xl font-black font-sans uppercase text-white placeholder-gray-800 focus:outline-none border-l-4 border-transparent focus:border-zzz-lime pl-4 py-1 transition-all overflow-hidden leading-none resize-none"
            />
            <div className="absolute -left-6 top-2 bottom-2 w-1 bg-zzz-gray/20 group-hover:bg-zzz-gray/50 transition-colors pointer-events-none" />
          </div>

          {/* Editor */}
          <div className="min-h-[500px]">
            <Editor
              content={post.contentJson ?? ""}
              onChange={handleContentChange}
            />
          </div>

          {/* Bottom Spacer */}
          <div className="h-40 flex items-center justify-center opacity-30 pointer-events-none">
            <div className="h-1 w-20 bg-zzz-gray" />
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
