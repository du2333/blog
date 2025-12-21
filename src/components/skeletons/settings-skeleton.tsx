export function SectionSkeleton() {
  return (
    <div className="space-y-16 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-end justify-between border-b border-zinc-100 dark:border-white/5 pb-10">
        <div className="space-y-3">
          <div className="h-10 w-40 bg-zinc-100 dark:bg-zinc-900 rounded"></div>
          <div className="h-2 w-64 bg-zinc-50 dark:bg-zinc-900/50 rounded opacity-50"></div>
        </div>
        <div className="h-8 w-24 bg-zinc-50 dark:bg-zinc-900 rounded-full"></div>
      </div>

      <div className="space-y-px">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col sm:flex-row py-10 gap-4 sm:gap-0 border-b border-zinc-100/60 dark:border-white/[0.02]">
            <div className="w-56 shrink-0">
              <div className="h-3 w-24 bg-zinc-100 dark:bg-zinc-900 rounded"></div>
            </div>
            <div className="flex-1 space-y-4">
              <div className="h-4 w-full max-w-md bg-zinc-50 dark:bg-zinc-900/50 rounded"></div>
              {i === 3 && <div className="h-12 w-48 bg-zinc-100 dark:bg-zinc-900 rounded-sm mt-8"></div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
