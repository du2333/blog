export function SectionSkeleton() {
  return (
    <div className="bg-white dark:bg-white/[0.02] border border-zinc-100 dark:border-white/5 p-8 space-y-10 rounded-sm animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between pb-6 border-b border-zinc-100 dark:border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-white/5"></div>
          <div className="space-y-2">
            <div className="h-4 w-24 bg-zinc-100 dark:bg-white/5 rounded"></div>
            <div className="h-2 w-16 bg-zinc-100 dark:bg-white/5 rounded opacity-50"></div>
          </div>
        </div>
        <div className="h-2 w-20 bg-zinc-100 dark:bg-white/5 rounded opacity-30"></div>
      </div>

      {/* Selector Skeleton */}
      <div className="space-y-4">
        <div className="h-2 w-24 bg-zinc-100 dark:bg-white/5 rounded"></div>
        <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-50 dark:bg-white/[0.03] rounded-sm">
          <div className="h-8 bg-white dark:bg-zinc-800 rounded-sm"></div>
          <div className="h-8 bg-transparent"></div>
        </div>
      </div>

      {/* Input Fields Skeleton */}
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="h-2 w-32 bg-zinc-100 dark:bg-white/5 rounded"></div>
          <div className="h-14 bg-zinc-50 dark:bg-white/[0.03] w-full rounded-sm"></div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1 space-y-4">
            <div className="h-2 w-24 bg-zinc-100 dark:bg-white/5 rounded"></div>
            <div className="h-14 bg-zinc-50 dark:bg-white/[0.03] w-full rounded-sm"></div>
          </div>
          <div className="w-32 h-14 bg-zinc-100 dark:bg-white/5 mt-auto rounded-sm"></div>
        </div>
      </div>

      {/* Bottom info */}
      <div className="pt-4 space-y-2">
        <div className="h-2 w-20 bg-zinc-100 dark:bg-white/5 rounded opacity-30"></div>
        <div className="h-20 bg-zinc-50 dark:bg-white/[0.02] rounded-sm"></div>
      </div>
    </div>
  );
}
