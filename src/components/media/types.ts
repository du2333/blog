// 从 DB schema 推断类型，避免重复定义
export type { Media as MediaAsset } from "@/features/media/data/media.data";

export interface UploadItem {
  id: string;
  name: string;
  size: string;
  progress: number;
  status: "WAITING" | "UPLOADING" | "COMPLETE" | "ERROR";
  log: string;
  file?: File;
}
