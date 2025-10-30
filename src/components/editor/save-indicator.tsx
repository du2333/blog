import type { SaveIndicatorProps } from "./types";

export function SaveIndicator({ status }: SaveIndicatorProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  if (status.status === "idle" && !status.lastSavedAt) {
    return null;
  }

  return (
    <div className="absolute bottom-4 right-8 flex items-center gap-2 text-sm text-muted-foreground">
      {status.status === "saving" ? (
        <>
          <div className="h-2 w-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span>保存中...</span>
        </>
      ) : status.status === "saved" && status.lastSavedAt ? (
        <>
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span>最后保存时间：{formatTime(status.lastSavedAt)}</span>
        </>
      ) : null}
    </div>
  );
}
