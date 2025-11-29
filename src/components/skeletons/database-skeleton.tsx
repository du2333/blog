export function DatabaseSkeleton() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20 px-4 animate-pulse">
      {/* Header Skeleton */}
      <div className="border-b border-zzz-gray pb-6 mb-8 flex flex-col md:flex-row justify-between items-end gap-4">
        <div className="space-y-3">
          <div className="h-10 w-48 md:w-64 bg-zzz-gray/20 rounded-sm"></div>
          <div className="h-4 w-64 md:w-96 bg-zzz-gray/10 rounded-sm"></div>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-6 w-16 bg-zzz-gray/10 border border-zzz-gray/20 rounded-sm"
            ></div>
          ))}
        </div>
      </div>

      {/* Post Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-[300px] bg-zzz-dark border-2 border-zzz-gray/30 p-6 flex flex-col relative overflow-hidden clip-corner-tr"
          >
            {/* Top Decorative Bar */}
            <div className="absolute top-0 left-0 w-full h-2 bg-zzz-gray/20 flex">
              <div className="w-1/3 bg-black/30"></div>
            </div>

            {/* Meta: Category & ID */}
            <div className="flex justify-between mb-8 mt-2">
              <div className="h-6 w-24 bg-zzz-gray/20 rounded-sm"></div>
              <div className="h-8 w-16 bg-zzz-gray/10 rounded-sm"></div>
            </div>

            {/* Title */}
            <div className="h-8 w-3/4 bg-zzz-gray/20 mb-4 rounded-sm"></div>

            {/* Summary Lines */}
            <div className="space-y-2 mb-6">
              <div className="h-3 w-full bg-zzz-gray/10 rounded-sm"></div>
              <div className="h-3 w-5/6 bg-zzz-gray/10 rounded-sm"></div>
              <div className="h-3 w-4/6 bg-zzz-gray/10 rounded-sm"></div>
            </div>

            {/* Footer */}
            <div className="mt-auto pt-6 border-t border-zzz-gray/20 flex justify-between items-center">
              <div className="flex gap-3 items-center">
                <div className="h-12 w-14 bg-zzz-gray/20 rounded-sm"></div>
                <div className="space-y-1">
                  <div className="h-3 w-10 bg-zzz-gray/10 rounded-sm"></div>
                  <div className="h-3 w-20 bg-zzz-gray/10 rounded-sm"></div>
                </div>
              </div>
              <div className="h-10 w-10 bg-zzz-gray/20 rounded-sm"></div>
            </div>

            {/* Deco Overlay */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-zzz-gray/20 to-transparent"></div>
          </div>
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="flex items-center justify-center gap-4 mt-16 opacity-50">
        <div className="h-10 w-32 bg-zzz-gray/20 clip-corner-bl"></div>
        <div className="h-12 w-48 bg-zzz-gray/10 border-2 border-zzz-gray/20 flex items-center justify-center">
          <div className="h-4 w-24 bg-zzz-gray/20"></div>
        </div>
        <div className="h-10 w-32 bg-zzz-gray/20 clip-corner-tr"></div>
      </div>
    </div>
  );
}
