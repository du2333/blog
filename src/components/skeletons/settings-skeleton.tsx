export function SectionSkeleton() {
  return (
    <div className="bg-zzz-black border border-zzz-gray p-1 clip-corner-tr animate-pulse">
      <div className="bg-zzz-dark/50 p-6 space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between border-b border-zzz-gray/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-zzz-gray/20 rounded-sm"></div>
            <div className="space-y-2">
              <div className="h-4 w-32 bg-zzz-gray/30 rounded-sm"></div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-zzz-gray/20"></div>
                <div className="h-2 w-16 bg-zzz-gray/10 rounded-sm"></div>
              </div>
            </div>
          </div>
          <div className="h-5 w-16 bg-zzz-gray/20 border border-zzz-gray/30 rounded-sm"></div>
        </div>

        {/* Selector Skeleton */}
        <div className="space-y-2">
          <div className="h-2 w-24 bg-zzz-gray/20 rounded-sm"></div>
          <div className="flex bg-black border border-zzz-gray/30 p-1 gap-1">
            <div className="flex-1 h-8 bg-zzz-gray/10"></div>
            <div className="flex-1 h-8 bg-zzz-gray/10"></div>
          </div>
        </div>

        {/* Input Fields Skeleton */}
        <div className="space-y-5">
          <div className="space-y-2">
            <div className="flex justify-between">
              <div className="h-2 w-28 bg-zzz-gray/20 rounded-sm"></div>
              <div className="h-2 w-16 bg-zzz-gray/20 rounded-sm"></div>
            </div>
            <div className="h-11 bg-black border border-zzz-gray/30 w-full"></div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1 space-y-2">
              <div className="h-2 w-24 bg-zzz-gray/20 rounded-sm"></div>
              <div className="h-10 bg-black border border-zzz-gray/30 w-full"></div>
            </div>
            <div className="w-28 h-10 bg-zzz-gray/20 mt-auto clip-corner-tr"></div>
          </div>
        </div>

        {/* Monitor Skeleton */}
        <div className="mt-4 pt-4 border-t border-zzz-gray/10 space-y-1">
          <div className="h-2 w-20 bg-zzz-gray/10 mb-2"></div>
          <div className="h-20 bg-black/40 border border-zzz-gray/20"></div>
        </div>
      </div>
    </div>
  );
}
