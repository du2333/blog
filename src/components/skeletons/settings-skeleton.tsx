export function SectionSkeleton() {
  return (
    <div className="bg-white dark:bg-[#0c0c0c] p-10 sm:p-14 space-y-16 animate-pulse rounded-sm border border-zinc-100 dark:border-white/5">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-900"></div>
          <div className="space-y-2">
            <div className="h-6 w-32 bg-zinc-100 dark:bg-zinc-900 rounded"></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12 max-w-2xl">
        {/* Selector Skeleton */}
        <div className="space-y-6">
          <div className="h-2 w-24 bg-zinc-100 dark:bg-zinc-900 rounded opacity-30"></div>
          <div className="flex gap-3">
            <div className="h-14 w-32 bg-zinc-100 dark:bg-zinc-900 rounded-sm"></div>
            <div className="h-14 w-32 bg-zinc-100 dark:bg-zinc-900 rounded-sm opacity-50"></div>
          </div>
        </div>

        {/* Input Skeleton */}
        <div className="space-y-6">
          <div className="h-2 w-32 bg-zinc-100 dark:bg-zinc-900 rounded opacity-30"></div>
          <div className="h-16 w-full border-b border-zinc-100 dark:border-zinc-900"></div>
        </div>

        {/* Bottom Area Skeleton */}
        <div className="flex flex-col md:flex-row gap-10 md:items-end">
          <div className="flex-1 space-y-6">
            <div className="h-2 w-24 bg-zinc-100 dark:bg-zinc-900 rounded opacity-30"></div>
            <div className="h-16 w-full border-b border-zinc-100 dark:border-zinc-900"></div>
          </div>
          <div className="h-[60px] w-48 bg-zinc-100 dark:bg-zinc-900 rounded-sm"></div>
        </div>
      </div>
    </div>
  );
}
