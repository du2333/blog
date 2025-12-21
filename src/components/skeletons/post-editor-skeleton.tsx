export function PostEditorSkeleton() {
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] relative overflow-hidden bg-white dark:bg-[#050505] animate-pulse">
      {/* Toolbar Skeleton */}
      <div className="h-20 border-b border-zinc-100 dark:border-white/5 flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-8">
          <div className="h-4 w-16 bg-zinc-100 dark:bg-zinc-900 rounded"></div>
          <div className="h-6 w-px bg-zinc-100 dark:bg-zinc-900"></div>
          <div className="h-3 w-40 bg-zinc-100 dark:bg-zinc-900 rounded opacity-40"></div>
        </div>
        <div className="flex items-center gap-6">
          <div className="h-10 w-24 bg-zinc-100 dark:bg-zinc-900 rounded-sm"></div>
          <div className="h-10 w-32 bg-zinc-100 dark:bg-zinc-900 rounded-sm"></div>
        </div>
      </div>

      {/* Main Document Area Skeleton */}
      <div className="flex-1 overflow-y-auto relative">
        <div className="w-full max-w-5xl mx-auto py-24 px-16 min-h-full">
          {/* Title Skeleton */}
          <div className="mb-20 space-y-6">
            <div className="h-2 w-24 bg-zinc-100 dark:bg-zinc-900 rounded opacity-20"></div>
            <div className="h-24 w-3/4 bg-zinc-100 dark:bg-zinc-900 rounded"></div>
            <div className="h-24 w-1/2 bg-zinc-100 dark:bg-zinc-900 rounded opacity-50"></div>
          </div>

          {/* Editor Placeholder Skeleton */}
          <div className="space-y-10">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-4">
                <div className="h-4 w-full bg-zinc-100 dark:bg-zinc-900 rounded opacity-40"></div>
                <div className="h-4 w-[95%] bg-zinc-100 dark:bg-zinc-900 rounded opacity-30"></div>
                <div className="h-4 w-[90%] bg-zinc-100 dark:bg-zinc-900 rounded opacity-20"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

