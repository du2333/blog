import { memo } from "react";

export const PostRowSkeleton = memo(() => (
  <div className="px-6 py-6 flex flex-col md:grid md:grid-cols-12 gap-4 items-start md:items-center border-b border-border animate-pulse">
    {/* Title & Summary */}
    <div className="md:col-span-6 space-y-3 w-full">
      <div className="h-5 w-2/3 bg-muted rounded"></div>
      <div className="h-2.5 w-1/2 bg-muted rounded opacity-50"></div>
    </div>

    {/* Status */}
    <div className="md:col-span-3 w-full">
      <div className="h-8 w-20 bg-muted rounded-full"></div>
    </div>

    {/* Date & Actions */}
    <div className="md:col-span-3 flex justify-between items-center w-full">
      <div className="space-y-2">
        <div className="h-2.5 w-24 bg-muted rounded"></div>
        <div className="h-2 w-20 bg-muted rounded opacity-40"></div>
      </div>
      <div className="w-8 h-8 rounded-sm bg-muted"></div>
    </div>
  </div>
));

PostRowSkeleton.displayName = "PostRowSkeleton";

export function PostManagerSkeleton() {
  return (
    <div className="space-y-8">
      {/* Toolbar Skeleton */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-10 pb-8 border-b border-border">
        <div className="w-full md:w-96 h-12 bg-muted rounded-sm"></div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="h-10 w-24 bg-muted rounded-sm"></div>
          <div className="h-10 w-24 bg-muted rounded-sm"></div>
          <div className="h-10 w-24 bg-muted rounded-sm"></div>
        </div>
      </div>

      {/* List Header Skeleton */}
      <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 border-b border-border bg-secondary/10">
        {[6, 3, 3].map((span, i) => (
          <div
            key={i}
            className={`col-span-${span} h-2.5 bg-muted rounded opacity-30`}
          ></div>
        ))}
      </div>

      {/* Rows Skeletons */}
      <div>
        {[1, 2, 3, 4, 5].map((i) => (
          <PostRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
