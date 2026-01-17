export function LoadingFallback() {
  return (
    <div className="w-full max-w-3xl mx-auto px-6 md:px-0 py-16 space-y-16 animate-in fade-in duration-500">
      {/* Header Skeleton */}
      <div className="space-y-4">
        <div className="h-3 w-24 bg-muted/30 animate-pulse"></div>
        <div className="h-10 w-2/3 bg-muted/30 animate-pulse"></div>
      </div>

      {/* Post List Skeleton */}
      <div className="divide-y divide-border/20">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="py-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-5 w-3/5 bg-muted/20 animate-pulse"></div>
              <div className="h-3 w-16 bg-muted/10 animate-pulse"></div>
            </div>
            <div className="h-4 w-4/5 bg-muted/10 animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
