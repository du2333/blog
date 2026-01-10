import { Skeleton } from "@/components/ui/skeleton";

export const CommentSectionSkeleton = () => {
  return (
    <section className="space-y-12 mt-32 pt-16 border-t border-border/50 animate-in fade-in duration-700">
      <header className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-8 w-32" />
        </div>
      </header>

      {/* Main Editor Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-32 w-full rounded-sm" />
        <div className="flex justify-end">
          <Skeleton className="h-10 w-24 rounded-sm" />
        </div>
      </div>

      {/* Comments List Skeleton */}
      <div className="divide-y divide-border/30">
        {[1, 2, 3].map((i) => (
          <div key={i} className="py-8 space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="w-10 h-10 rounded-sm shrink-0" />
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-12" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
