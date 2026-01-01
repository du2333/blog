import type { JSONContent } from "@tiptap/react";
import type { Post, PostCategory, PostStatus } from "@/lib/db/schema";

export interface PostEditorData {
  title: string;
  summary: string;
  slug: string;
  category: PostCategory;
  status: PostStatus;
  readTimeInMinutes: number;
  contentJson: JSONContent | null;
  publishedAt: Date | null;
}

export interface PostEditorProps {
  initialData: Post;
  onSave: (data: PostEditorData) => Promise<void>;
}

export type SaveStatus = "SYNCED" | "SAVING" | "PENDING" | "ERROR";

export const defaultPostData: PostEditorData = {
  title: "",
  summary: "",
  slug: "",
  category: "DEV",
  status: "draft",
  readTimeInMinutes: 1,
  contentJson: null,
  publishedAt: null,
};
