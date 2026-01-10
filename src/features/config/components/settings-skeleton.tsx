export function SectionSkeleton() {
  return (
    <div className="space-y-16 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-end justify-between border-b border-border pb-10">
        <div className="space-y-3">
          <div className="h-10 w-40 bg-muted rounded"></div>
          <div className="h-2 w-64 bg-muted rounded opacity-50"></div>
        </div>
        <div className="h-8 w-24 bg-muted rounded-full"></div>
      </div>

      <div className="space-y-px">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex flex-col sm:flex-row py-10 gap-4 sm:gap-0 border-b border-border"
          >
            <div className="w-56 shrink-0">
              <div className="h-3 w-24 bg-muted rounded"></div>
            </div>
            <div className="flex-1 space-y-4">
              <div className="h-4 w-full max-w-md bg-muted rounded"></div>
              {i === 3 && (
                <div className="h-12 w-48 bg-muted rounded-sm mt-8"></div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
