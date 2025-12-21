import { memo } from "react";

export const PostRowSkeleton = memo(() => (
  <div className="px-6 py-10 flex flex-col md:grid md:grid-cols-12 gap-8 items-start md:items-center border-b border-zinc-100 dark:border-white/5 animate-pulse">
    {/* ID */}
    <div className="md:col-span-1">
      <div className="h-3 w-8 bg-zinc-100 dark:bg-zinc-900 rounded"></div>
    </div>

    {/* Title & Summary */}
    <div className="md:col-span-6 space-y-3 w-full">
      <div className="h-6 w-2/3 bg-zinc-100 dark:bg-zinc-900 rounded"></div>
      <div className="h-3 w-1/2 bg-zinc-100 dark:bg-zinc-900 rounded opacity-50"></div>
    </div>

    {/* Category & Date */}
    <div className="md:col-span-4 grid grid-cols-2 gap-6 w-full">
      <div className="h-3 w-20 bg-zinc-100 dark:bg-zinc-900 rounded"></div>
      <div className="h-3 w-24 bg-zinc-100 dark:bg-zinc-900 rounded"></div>
    </div>

    {/* Actions */}
    <div className="md:col-span-1 flex justify-end gap-2">
      <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-900"></div>
    </div>
  </div>
));

PostRowSkeleton.displayName = "PostRowSkeleton";

export function PostManagerSkeleton() {
  return (
    <div className="space-y-8">
      {/* Toolbar Skeleton */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-10 pb-8 border-b border-zinc-100 dark:border-white/5">
        <div className="w-full md:w-96 h-12 bg-zinc-100 dark:bg-zinc-900 rounded-sm"></div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="h-10 w-24 bg-zinc-100 dark:bg-zinc-900 rounded-sm"></div>
          <div className="h-10 w-24 bg-zinc-100 dark:bg-zinc-900 rounded-sm"></div>
          <div className="h-10 w-24 bg-zinc-100 dark:bg-zinc-900 rounded-sm"></div>
        </div>
      </div>

      {/* List Header Skeleton */}
      <div className="hidden md:grid grid-cols-12 gap-6 px-6 py-4 border-b border-zinc-100 dark:border-white/5">
        {[1, 6, 2, 2, 1].map((span, i) => (
          <div key={i} className={`col-span-${span} h-2 bg-zinc-100 dark:bg-zinc-900 rounded opacity-30`}></div>
        ))}
      </div>

      {/* Rows Skeletons */}
      <div className="bg-white dark:bg-transparent">
        {[1, 2, 3, 4, 5].map((i) => (
          <PostRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

