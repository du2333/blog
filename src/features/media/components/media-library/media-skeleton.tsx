import { memo } from "react";

export const MediaCardSkeleton = memo(() => (
  <div className="flex flex-col space-y-4 animate-pulse">
    <div className="aspect-square bg-muted rounded-sm" />
    <div className="space-y-2 px-1">
      <div className="h-3 w-3/4 bg-muted rounded" />
      <div className="flex justify-between">
        <div className="h-2 w-1/4 bg-muted rounded opacity-50" />
        <div className="h-2 w-1/4 bg-muted rounded opacity-50" />
      </div>
    </div>
  </div>
));

MediaCardSkeleton.displayName = "MediaCardSkeleton";

export function MediaLibrarySkeleton() {
  return (
    <div className="space-y-12">
      {/* Header Skeleton */}
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <div className="h-10 w-48 bg-muted rounded"></div>
          <div className="h-3 w-32 bg-muted rounded opacity-30"></div>
        </div>
        <div className="h-12 w-32 bg-muted rounded-sm"></div>
      </div>

      {/* Stats Skeleton */}
      <div className="flex gap-12 pt-6 border-t border-border">
        {[1, 2].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-2 w-12 bg-muted rounded opacity-30"></div>
            <div className="h-6 w-20 bg-muted rounded"></div>
          </div>
        ))}
      </div>

      {/* Toolbar Skeleton */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center py-8 border-y border-border">
        <div className="w-full md:w-96 h-12 bg-muted rounded-sm"></div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="h-10 w-24 bg-muted rounded-sm"></div>
          <div className="h-10 w-24 bg-muted rounded-sm"></div>
        </div>
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
        {Array.from({ length: 12 }).map((_, i) => (
          <MediaCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
