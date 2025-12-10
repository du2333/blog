import { Editor } from "@/components/editor";
import type { JSONContent } from "@tiptap/react";
import { useRouter } from "@tanstack/react-router";
import { useCallback, useState } from "react";

import { EditorToolbar, SettingsDrawer } from "./components";
import { useAutoSave, usePostActions } from "./hooks";
import { type PostEditorData, type PostEditorProps } from "./types";

// Re-export types for external use
export type { PostEditorData, PostEditorProps } from "./types";

export function PostEditor({ initialData, onSave }: PostEditorProps) {
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

  // Post actions hook (slug, read time, summary)
  const {
    isGeneratingSlug,
    isCalculatingReadTime,
    isGeneratingSummary,
    handleGenerateSlug,
    handleCalculateReadTime,
    handleGenerateSummary,
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
      />

      {/* Main Document Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative">
        <div className="w-full max-w-4xl mx-auto py-12 px-6 md:px-12 min-h-full bg-black">
          {/* Document Title */}
          <div className="mb-8 relative group">
            <input
              type="text"
              value={post.title}
              onChange={(e) => setPost({ ...post, title: e.target.value })}
              placeholder="ENTER TITLE..."
              className="w-full bg-transparent text-4xl md:text-6xl font-black font-sans uppercase text-white placeholder-gray-800 focus:outline-none border-l-4 border-transparent focus:border-zzz-lime pl-4 transition-all"
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
      />
    </div>
  );
}
