import { useEditor } from "@tiptap/react";
import { EditorContent } from "@tiptap/react";
import { BubbleMenu } from "./bubble-menu";
import { SaveIndicator } from "./save-indicator";
import { createEditorConfig } from "./use-editor-config";
import { useAutoSave } from "./use-auto-save";
import type { EditorProps } from "./types";
import "./style.css";

export function Editor({ content, onSave, onSaveStatusChange }: EditorProps) {
  const { saveStatus, handleUpdate } = useAutoSave({
    onSave,
    onSaveStatusChange,
  });

  const editor = useEditor({
    ...createEditorConfig(content),
    onUpdate: ({ editor }) => {
      handleUpdate(editor);
    },
  });

  if (!editor) return null;

  return (
    <div className="relative w-full border bg-card pb-[60px] sm:pb-0">
      <div className="max-h-[calc(100dvh-6rem)] overflow-hidden overflow-y-scroll">
        <EditorContent editor={editor} />
        <BubbleMenu editor={editor} />
      </div>
      <SaveIndicator status={saveStatus} />
    </div>
  );
}

// Re-export types for convenience
export type { EditorProps, SaveStatus } from "./types";
