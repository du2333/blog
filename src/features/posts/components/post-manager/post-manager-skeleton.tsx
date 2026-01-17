import { memo } from "react";

export const PostRowSkeleton = memo(() => (
  <div className="px-4 py-4 flex flex-col md:grid md:grid-cols-12 gap-4 items-center border-b border-border/30 animate-pulse">
    {/* Info Block */}
    <div className="md:col-span-6 w-full flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <div className="h-3 w-8 bg-muted/40 rounded-none"></div>
      </div>
      <div className="h-6 w-3/4 bg-muted/60 rounded-none"></div>
      <div className="h-3 w-1/2 bg-muted/30 rounded-none"></div>
    </div>

    {/* Status */}
    <div className="md:col-span-2 w-full">
      <div className="h-5 w-16 bg-muted/40 rounded-none border border-border/20"></div>
    </div>

    {/* Date */}
    <div className="md:col-span-3 w-full space-y-1">
      <div className="h-3 w-32 bg-muted/30 rounded-none"></div>
      <div className="h-3 w-28 bg-muted/30 rounded-none"></div>
    </div>

    {/* Actions */}
    <div className="md:col-span-1 flex justify-end gap-2 w-full">
      <div className="h-8 w-8 bg-muted/40 rounded-none"></div>
      <div className="h-8 w-8 bg-muted/40 rounded-none"></div>
    </div>
  </div>
));

PostRowSkeleton.displayName = "PostRowSkeleton";

export function PostManagerSkeleton() {
  return (
    <div className="space-y-8 pb-20">
      {/* Header Skeleton */}
      <div className="flex justify-between items-end border-b border-border/30 pb-6">
        <div className="space-y-2">
          <div className="h-4 w-48 bg-muted/50 rounded-none"></div>
          <div className="h-8 w-32 bg-muted/50 rounded-none"></div>
        </div>
        <div className="h-10 w-32 bg-muted/50 rounded-none"></div>
      </div>

      {/* Toolbar Skeleton */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8 border-b border-border/30 pb-8">
        <div className="w-full lg:flex-1 h-10 bg-muted/30 rounded-none border border-border/20"></div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-24 bg-muted/30 rounded-none border border-border/20"></div>
          <div className="h-10 w-24 bg-muted/30 rounded-none border border-border/20"></div>
        </div>
      </div>

      {/* Rows Skeletons */}
      <div className="border-t border-border/30">
        {[1, 2, 3, 4, 5].map((i) => (
          <PostRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
