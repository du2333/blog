import TechButton from "@/components/ui/tech-button";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export function ArticleSkeleton() {
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-7xl mx-auto pb-20 px-4 md:px-8">
      {/* Top Navigation */}
      <div className="mb-8 flex justify-between items-end">
        <TechButton
          onClick={() => navigate({ to: "/" })}
          variant="secondary"
          icon={<ArrowLeft size={16} />}
        >
          RETURN TO ARCHIVE
        </TechButton>
        <div className="hidden md:flex flex-col items-end gap-1">
          <div className="h-3 w-32 bg-zzz-gray/50 animate-pulse rounded-sm"></div>
          <div className="h-3 w-48 bg-zzz-gray/30 animate-pulse rounded-sm"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_250px] gap-8 items-start">
        {/* Main Article Skeleton */}
        <article className="relative bg-zzz-black border border-zzz-gray shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          {/* Decorative Top Bar */}
          <div className="w-full h-2 bg-stripe-pattern border-b border-zzz-gray"></div>

          {/* Header Skeleton */}
          <div className="p-6 md:p-12 pb-8 border-b border-zzz-gray bg-zzz-dark relative overflow-hidden">
            {/* Background pulse */}
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-zzz-gray/10 blur-[100px] animate-pulse"></div>

            {/* Category Tag */}
            <div className="h-6 w-32 bg-zzz-gray animate-pulse mb-8 rounded-sm"></div>

            {/* Title Lines */}
            <div className="space-y-4 mb-8">
              <div className="h-12 md:h-16 w-3/4 bg-zzz-gray animate-pulse rounded-sm"></div>
              <div className="h-12 md:h-16 w-1/2 bg-zzz-gray animate-pulse rounded-sm"></div>
            </div>

            {/* Meta Data */}
            <div className="flex gap-6 pt-6 border-t border-zzz-gray/30">
              <div className="h-5 w-32 bg-zzz-gray/50 animate-pulse rounded-sm"></div>
              <div className="h-5 w-32 bg-zzz-gray/50 animate-pulse rounded-sm"></div>
            </div>
          </div>

          {/* Body Skeleton */}
          <div className="p-6 md:p-12 bg-zzz-black relative">
            {/* Sidebar decoration line */}
            <div className="hidden md:block absolute left-4 top-12 bottom-12 w-px bg-zzz-gray"></div>

            {/* Summary Block */}
            <div className="mb-16 pl-6 border-l-4 border-zzz-gray/50">
              <div className="h-6 w-full bg-zzz-gray/20 animate-pulse mb-2 rounded-sm"></div>
              <div className="h-6 w-5/6 bg-zzz-gray/20 animate-pulse mb-2 rounded-sm"></div>
              <div className="h-6 w-4/6 bg-zzz-gray/20 animate-pulse rounded-sm"></div>
            </div>

            {/* Content Paragraphs */}
            <div className="max-w-none md:pl-8 space-y-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-3">
                  <div className="h-4 w-full bg-zzz-gray/10 animate-pulse rounded-sm"></div>
                  <div className="h-4 w-11/12 bg-zzz-gray/10 animate-pulse rounded-sm"></div>
                  <div className="h-4 w-full bg-zzz-gray/10 animate-pulse rounded-sm"></div>
                  {i === 2 && (
                    <div className="h-64 w-full bg-zzz-dark border-2 border-zzz-gray/30 animate-pulse mt-6 flex items-center justify-center">
                      <span className="font-mono text-zzz-gray/50 text-xs">
                        LOADING_VISUAL_DATA...
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Footer Skeleton */}
            <div className="mt-20 pt-8 border-t-2 border-zzz-gray border-dashed flex justify-between items-center">
              <div className="h-4 w-40 bg-zzz-gray/30 animate-pulse rounded-sm"></div>
              <div className="h-10 w-32 bg-zzz-gray/30 animate-pulse clip-corner-bl"></div>
            </div>
          </div>

          {/* Deco Corners */}
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-zzz-lime/20 clip-corner-bl"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-zzz-lime/20 clip-corner-tr"></div>
        </article>

        {/* Sticky Table of Contents Skeleton (Hidden on Mobile) */}
        <div className="hidden lg:block sticky top-32 w-full animate-pulse">
          <div className="h-8 w-32 bg-zzz-gray/30 mb-6 rounded-sm"></div>
          <div className="space-y-4 border-l-2 border-zzz-gray/20 pl-4">
            <div className="h-4 w-full bg-zzz-gray/20 rounded-sm"></div>
            <div className="h-4 w-3/4 bg-zzz-gray/20 rounded-sm ml-4"></div>
            <div className="h-4 w-5/6 bg-zzz-gray/20 rounded-sm ml-4"></div>
            <div className="h-4 w-full bg-zzz-gray/20 rounded-sm"></div>
            <div className="h-4 w-2/3 bg-zzz-gray/20 rounded-sm ml-4"></div>
            <div className="h-4 w-4/5 bg-zzz-gray/20 rounded-sm"></div>
          </div>

          {/* Deco Footer for TOC */}
          <div className="mt-8 pt-4 border-t border-zzz-gray/20">
            <div className="h-3 w-24 bg-zzz-gray/20 rounded-sm"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
