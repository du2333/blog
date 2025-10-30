import type { SaveStatus } from "@/components/editor/types";
import type { Editor, JSONContent } from "@tiptap/react";
import { useEffect, useRef, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";

interface UseAutoSaveOptions {
  onSave?: (json: JSONContent) => void | Promise<void>;
  onSaveStatusChange?: (status: SaveStatus) => void;
  debounceMs?: number;
}

export function useAutoSave(options: UseAutoSaveOptions = {}) {
  const { onSave, onSaveStatusChange, debounceMs = 1000 } = options;

  const [saveStatus, setSaveStatus] = useState<SaveStatus>({
    status: "idle",
    lastSavedAt: null,
  });

  const [editorContent, setEditorContent] = useState<JSONContent | null>(null);
  const debouncedContent = useDebounce(editorContent, debounceMs);
  const isSavingRef = useRef(false);

  const handleSave = async (json: JSONContent) => {
    if (!json || !onSave || isSavingRef.current) {
      return;
    }

    isSavingRef.current = true;

    try {
      await onSave(json);
      const now = new Date();
      const newStatus: SaveStatus = { status: "saved", lastSavedAt: now };
      setSaveStatus(newStatus);
      onSaveStatusChange?.(newStatus);
    } catch (error) {
      setSaveStatus((prev) => {
        const newStatus: SaveStatus = {
          status: "idle",
          lastSavedAt: prev.lastSavedAt,
        };
        onSaveStatusChange?.(newStatus);
        return newStatus;
      });
    } finally {
      isSavingRef.current = false;
    }
  };

  const handleUpdate = (editor: Editor) => {
    const json = editor.getJSON();

    // Update status to saving if not already saving
    if (!isSavingRef.current) {
      setSaveStatus((prev) => {
        const newStatus: SaveStatus = {
          status: "saving",
          lastSavedAt: prev.lastSavedAt,
        };
        onSaveStatusChange?.(newStatus);
        return newStatus;
      });
    }

    // Update content, which will be debounced
    setEditorContent(json);
  };

  // Trigger save when debounced content changes
  useEffect(() => {
    if (debouncedContent !== null && onSave) {
      handleSave(debouncedContent);
    }
  }, [debouncedContent]);

  return {
    saveStatus,
    handleUpdate,
  };
}
