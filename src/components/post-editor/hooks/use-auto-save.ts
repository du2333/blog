import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { PostEditorData, SaveStatus } from "../types";

interface UseAutoSaveOptions {
  mode: "new" | "edit";
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
  handleManualSave: () => Promise<void>;
}

export function useAutoSave({
  mode,
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

  // Auto-save effect (edit mode only)
  useEffect(() => {
    if (mode === "new") {
      setSaveStatus("PENDING");
      return;
    }

    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    if (!post.title.trim() || !post.slug.trim()) {
      setSaveStatus("PENDING");
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
  }, [post, mode, debounceMs]);

  // Manual save for new posts
  const handleManualSave = async () => {
    if (!post.title.trim() || !post.slug.trim()) {
      toast.error("VALIDATION ERROR", {
        description: "Title and slug are required to create a post.",
      });
      return;
    }

    setSaveStatus("SAVING");
    try {
      setError(null);
      await onSaveRef.current(post);
      toast.success("POST CREATED", {
        description: "Your new entry has been saved successfully.",
      });
    } catch (err) {
      console.error("Save failed:", err);
      setSaveStatus("ERROR");
      setError("MANUAL_SAVE_FAILED");
    }
  };

  return {
    saveStatus,
    lastSaved,
    error,
    setError,
    setSaveStatus,
    handleManualSave,
  };
}
