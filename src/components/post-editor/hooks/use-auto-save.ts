import { useEffect, useRef, useState } from "react";
import type { PostEditorData, SaveStatus } from "../types";

interface UseAutoSaveOptions {
  post: PostEditorData;
  onSave: (data: PostEditorData) => Promise<void>;
  debounceMs?: number;
}

interface UseAutoSaveReturn {
  saveStatus: SaveStatus;
  lastSaved: Date | null;
  error: string | null;
  setError: (error: string | null) => void;
  setSaveStatus: (status: SaveStatus) => void;
}

export function useAutoSave({
  post,
  onSave,
  debounceMs = 1500,
}: UseAutoSaveOptions): UseAutoSaveReturn {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("SYNCED");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isFirstMount = useRef(true);
  const isSaving = useRef(false);
  // Store onSave in ref to avoid effect re-running when onSave reference changes
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  // Auto-save effect - always enabled
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    setSaveStatus("SAVING");

    const timer = setTimeout(async () => {
      if (isSaving.current) return;
      isSaving.current = true;

      try {
        setError(null);
        await onSaveRef.current(post);
        setSaveStatus("SYNCED");
        setLastSaved(new Date());
      } catch (err) {
        console.error("Auto-save failed:", err);
        setSaveStatus("ERROR");
        setError("AUTO_SAVE_FAILED");
      } finally {
        isSaving.current = false;
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [post, debounceMs]);

  return {
    saveStatus,
    lastSaved,
    error,
    setError,
    setSaveStatus,
  };
}
