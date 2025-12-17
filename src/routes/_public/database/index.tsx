import { LoadingFallback } from "@/components/common/loading-fallback";
import { PostFeed } from "@/components/database-feed/post-feed";
import { PostLoader } from "@/components/database-feed/post-loader";
import { PostMobileFilter } from "@/components/database-feed/post-mobile-filter";
import { PostSidebar } from "@/components/database-feed/post-sidebar";
import { postsInfiniteQueryOptions } from "@/features/posts/posts.query";
import { PostCategory } from "@/lib/db/schema";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Database } from "lucide-react";
import { useCallback, useMemo } from "react";
import { z } from "zod";

const searchSchema = z.object({
  category: z.custom<PostCategory>().optional().catch(undefined),
});

export const Route = createFileRoute("/_public/database/")({
  component: RouteComponent,
  pendingComponent: LoadingFallback,
  validateSearch: searchSchema,
  loaderDeps: ({ search: { category } }) => ({ category }),
  loader: async ({ context, deps: { category } }) => {
    await context.queryClient.prefetchInfiniteQuery(
      postsInfiniteQueryOptions(category)
    );
  },
});

function RouteComponent() {
  const { category } = Route.useSearch();
  const navigate = useNavigate();

  // Active category for UI (convert undefined to "ALL")
  const activeCategory = category ?? "ALL";

  // Handle category change
  const handleCategoryChange = useCallback(
    (cat: string) => {
      navigate({
        to: "/database",
        search: cat === "ALL" ? {} : { category: cat as PostCategory },
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [navigate]
  );

  // Infinite query for posts (SSR prefetched in loader)
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery(postsInfiniteQueryOptions(category));

  // Flatten all pages into a single array
  const posts = useMemo(() => {
    return data?.pages.flatMap((page) => page.items) ?? [];
  }, [data]);

  // Load more handler
  const loadMore = useCallback(() => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  }, [isFetchingNextPage, hasNextPage, fetchNextPage]);

  return (
    <div className="w-full max-w-[1800px] mx-auto min-h-screen animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-forwards">
      {/* Header Section */}
      <div className="mb-8 md:mb-12 border-b border-zzz-gray pb-6 flex flex-col items-start md:flex-row md:items-end justify-between gap-6">
        <div>
          {/* 
              Fix: Removed outer pr-14. 
              Added 'pr-4' specifically to the inner span with 'bg-clip-text'. 
              This extends the background gradient box to cover the italic slant of the last letter 'e'.
           */}
          <h1 className="text-5xl md:text-7xl font-black font-sans uppercase text-white italic tracking-tighter flex items-center gap-4">
            <Database
              size={48}
              className="text-zzz-lime hidden md:block shrink-0"
            />
            <span>
              Data
              <span className="text-transparent bg-clip-text bg-linear-to-r from-zzz-lime to-zzz-cyan pr-4">
                base
              </span>
            </span>
          </h1>
          <p className="font-mono text-xs md:text-sm text-gray-500 mt-2 pl-2 border-l-2 border-zzz-lime">
            正在接入档案区段 01 // PROXY LOGS
          </p>
        </div>

        {/* Stats / Deco - Force left alignment on all breakpoints for consistency */}
        <div className="flex gap-8 font-mono text-[10px] text-gray-600 uppercase tracking-widest text-left w-full md:w-auto">
          <div>
            <div className="text-zzz-lime font-bold text-xl">
              {posts.length}
            </div>
            <div>条记录已加载</div>
          </div>
          <div>
            <div className="text-white font-bold text-xl">100%</div>
            <div>数据完整性</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 relative items-start">
        {/* Desktop Sidebar (Sticky) */}
        <PostSidebar
          activeCategory={activeCategory}
          onSelectCategory={handleCategoryChange}
        />

        {/* Main Feed Area */}
        <div className="flex-1 min-w-0 w-full">
          {/* Mobile Filter (Sticky) */}
          <PostMobileFilter
            activeCategory={activeCategory}
            onSelectCategory={handleCategoryChange}
          />

          {/* Content Feed */}
          <PostFeed posts={posts} />

          {/* Infinite Scroll Loader */}
          <PostLoader
            onLoadMore={loadMore}
            isLoading={isFetchingNextPage}
            hasMore={hasNextPage ?? false}
          />
        </div>
      </div>
    </div>
  );
}
