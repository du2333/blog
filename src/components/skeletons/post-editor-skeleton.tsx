export function PostEditorSkeleton() {
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] relative overflow-hidden bg-white dark:bg-[#050505] animate-pulse">
      {/* Toolbar Skeleton */}
      <div className="h-16 border-b border-zinc-100 dark:border-white/5 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-6">
          <div className="h-4 w-12 bg-zinc-100 dark:bg-zinc-900 rounded"></div>
          <div className="h-4 w-px bg-zinc-100 dark:bg-zinc-900"></div>
          <div className="h-3 w-32 bg-zinc-100 dark:bg-zinc-900 rounded"></div>
        </div>
        <div className="flex items-center gap-6">
          <div className="h-4 w-24 bg-zinc-100 dark:bg-zinc-900 rounded"></div>
          <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-900"></div>
        </div>
      </div>

      {/* Main Document Area Skeleton */}
      <div className="flex-1 overflow-y-auto relative">
        <div className="w-full max-w-4xl mx-auto py-20 px-6 md:px-12 min-h-full">
          {/* Title Skeleton */}
          <div className="mb-12 space-y-4">
            <div className="h-16 w-3/4 bg-zinc-100 dark:bg-zinc-900 rounded"></div>
            <div className="h-16 w-1/2 bg-zinc-100 dark:bg-zinc-900 rounded opacity-50"></div>
          </div>

          {/* Editor Placeholder Skeleton */}
          <div className="space-y-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-3">
                <div className="h-4 w-full bg-zinc-100 dark:bg-zinc-900 rounded opacity-40"></div>
                <div className="h-4 w-[90%] bg-zinc-100 dark:bg-zinc-900 rounded opacity-30"></div>
                <div className="h-4 w-[95%] bg-zinc-100 dark:bg-zinc-900 rounded opacity-20"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

