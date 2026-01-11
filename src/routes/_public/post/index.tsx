import {
  useSuspenseInfiniteQuery,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronDown, ChevronUp, RefreshCw, Tag } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";

import { blogConfig } from "@/blog.config";
import { LoadingFallback } from "@/components/common/loading-fallback";
import { Skeleton } from "@/components/ui/skeleton";
import { PostItem } from "@/features/posts/components/view/post-item";
import { postsInfiniteQueryOptions } from "@/features/posts/posts.query";
import { tagsQueryOptions } from "@/features/tags/tags.query";
import { cn } from "@/lib/utils";

const DisplayTagsQueryOptions = {
  ...tagsQueryOptions(),
};

export const Route = createFileRoute("/_public/post/")({
  validateSearch: z.object({
    tagName: z.string().optional(),
  }),
  component: RouteComponent,
  pendingComponent: LoadingFallback,
  loaderDeps: ({ search: { tagName } }) => ({ tagName }),
  loader: async ({ context, deps }) => {
    await Promise.all([
      context.queryClient.prefetchInfiniteQuery(
        postsInfiniteQueryOptions({ tagName: deps.tagName }),
      ),
      context.queryClient.prefetchQuery(DisplayTagsQueryOptions),
    ]);
  },
});

function RouteComponent() {
  const { tagName } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const { data: tags } = useSuspenseQuery(DisplayTagsQueryOptions);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery(postsInfiniteQueryOptions({ tagName }));

  const posts = useMemo(() => {
    return data.pages.flatMap((page) => page.items);
  }, [data]);

  // Infinite scroll observer
  const observerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1, rootMargin: "0px" },
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleTagClick = (clickedTag: string) => {
    navigate({
      search: {
        tagName: clickedTag === tagName ? undefined : clickedTag,
      },
      replace: true, // Replace history to avoid back-button clutter
    });
  };

  const [isExpanded, setIsExpanded] = useState(false);
  const INITIAL_TAG_COUNT = 8;
  const hasMoreTags = tags.length > INITIAL_TAG_COUNT;
  const visibleTags = isExpanded ? tags : tags.slice(0, INITIAL_TAG_COUNT);

  return (
    <div className="w-full max-w-7xl mx-auto pb-32 px-6 md:px-10">
      {/* Header Section */}
      <header className="py-20 md:py-32 space-y-12">
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
          <div className="flex items-center gap-3">
            <span className="h-px w-12 bg-foreground"></span>
          </div>
          <h1 className="text-6xl md:text-9xl font-serif font-medium leading-[0.9] tracking-tight text-foreground">
            文章
          </h1>
          <p className="max-w-xl text-lg md:text-xl font-normal leading-relaxed text-muted-foreground">
            {blogConfig.description}
          </p>
        </div>
      </header>

      {/* Tag Filters */}
      <div className="mb-20 space-y-6">
        <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase text-muted-foreground/60">
          <Tag size={12} strokeWidth={1.5} />
          <span>分类筛选</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => handleTagClick("")}
            className={cn(
              "px-5 py-2 rounded-full text-[13px] font-medium transition-all duration-300 border",
              !tagName
                ? "bg-foreground text-background border-foreground shadow-lg shadow-foreground/5"
                : "bg-secondary/40 text-muted-foreground border-transparent hover:bg-secondary hover:text-foreground",
            )}
          >
            全部
          </button>
          {visibleTags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => handleTagClick(tag.name)}
              className={cn(
                "group px-5 py-2 rounded-full text-[13px] font-medium transition-all duration-300 border flex items-center gap-2.5",
                tagName === tag.name
                  ? "bg-foreground text-background border-foreground shadow-lg shadow-foreground/5"
                  : "bg-secondary/40 text-muted-foreground border-transparent hover:bg-secondary hover:text-foreground",
              )}
            >
              <span>{tag.name}</span>
              <span
                className={cn(
                  "text-[10px] font-mono px-2 py-0.5 rounded-full transition-colors",
                  tagName === tag.name
                    ? "bg-background/20 text-background"
                    : "bg-background/50 text-muted-foreground group-hover:bg-background",
                )}
              >
                {tag.postCount}
              </span>
            </button>
          ))}

          {hasMoreTags && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors group"
            >
              {isExpanded ? (
                <>
                  <span>收起</span>
                  <ChevronUp
                    size={14}
                    className="group-hover:-translate-y-0.5 transition-transform"
                  />
                </>
              ) : (
                <>
                  <span>显示更多 ({tags.length - INITIAL_TAG_COUNT})</span>
                  <ChevronDown
                    size={14}
                    className="group-hover:translate-y-0.5 transition-transform"
                  />
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Posts List */}
      <div className="flex flex-col gap-0 border-t border-border">
        {posts.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            暂无文章
          </div>
        ) : (
          posts.map((post, index) => (
            <PostItem key={post.id} post={post} index={index} />
          ))
        )}
      </div>

      {/* Load More Area & Infinite Scroll Observer */}
      <div
        ref={observerRef}
        className="py-20 flex flex-col items-center justify-center gap-6"
      >
        {isFetchingNextPage ? (
          <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center">
                <RefreshCw
                  size={16}
                  className="text-muted-foreground animate-spin"
                />
              </div>
              <Skeleton className="absolute inset-0 w-12 h-12 rounded-full border-t border-primary bg-transparent animate-[spin_1.5s_linear_infinite]" />
            </div>
            <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-muted-foreground">
              加载中
            </span>
          </div>
        ) : hasNextPage ? (
          <div className="h-px w-24 bg-border"></div>
        ) : posts.length > 0 ? (
          <div className="flex flex-col items-center gap-3 opacity-20">
            <div className="h-px w-32 bg-current"></div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
