import type { Editor } from "@tiptap/react";
import { useEffect, useRef, useState } from "react";
import type { SaveStatus } from "./types";

interface UseAutoSaveOptions {
  onSave?: (json: any) => void | Promise<void>;
  onSaveStatusChange?: (status: SaveStatus) => void;
  debounceMs?: number;
}

export function useAutoSave(options: UseAutoSaveOptions = {}) {
  const { onSave, onSaveStatusChange, debounceMs = 1000 } = options;

  const [saveStatus, setSaveStatus] = useState<SaveStatus>({
    status: "idle",
    lastSavedAt: null,
  });

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);

  const handleSave = async (editor: Editor) => {
    if (!editor || !onSave || isSavingRef.current) {
      return;
    }

    isSavingRef.current = true;
    const json = editor.getJSON();

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
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

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

    // Schedule debounced save
    debounceTimeoutRef.current = setTimeout(() => {
      handleSave(editor);
    }, debounceMs);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return {
    saveStatus,
    handleUpdate,
  };
}

