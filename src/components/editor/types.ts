import type { JSONContent } from "@tiptap/react";

export type SaveStatus = {
  status: "idle" | "saving" | "saved";
  lastSavedAt: Date | null;
};

export interface EditorProps {
  content?: JSONContent | string;
  onSave?: (json: JSONContent) => void | Promise<void>;
  onSaveStatusChange?: (status: SaveStatus) => void;
}

export interface SaveIndicatorProps {
  status: SaveStatus;
}

