import {
  useSuspenseInfiniteQuery,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { RefreshCw } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { z } from "zod";

import type { TagWithCount } from "@/features/tags/tags.schema";
import { blogConfig } from "@/blog.config";
import { LoadingFallback } from "@/components/common/loading-fallback";
import { Skeleton } from "@/components/ui/skeleton";
import { PostItem } from "@/features/posts/components/view/post-item";
import { postsInfiniteQueryOptions } from "@/features/posts/posts.query";
import { tagsQueryOptions } from "@/features/tags/tags.query";
import { cn } from "@/lib/utils";

const DisplayTagsQueryOptions = {
  ...tagsQueryOptions({
    withCount: true,
    publicOnly: true,
    sortBy: "postCount",
    sortDir: "desc",
  }),
  select: (tags: Array<TagWithCount>) => tags.filter((t) => t.postCount > 0),
};

export const Route = createFileRoute("/_public/blog/")({
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
  head: () => ({
    meta: [
      {
        title: "文章",
      },
      {
        name: "description",
        content: blogConfig.description,
      },
    ],
  }),
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
      <div className="mb-12 overflow-x-auto pb-4 -mx-6 px-6 md:mx-0 md:px-0 scrollbar-none">
        <div className="flex items-center gap-2 min-w-max">
          <button
            onClick={() => handleTagClick("")}
            className={cn(
              "px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 border",
              !tagName
                ? "bg-foreground text-background border-foreground shadow-lg shadow-foreground/10"
                : "bg-background text-muted-foreground border-border hover:border-foreground/40 hover:text-foreground",
            )}
          >
            全部
          </button>
          {tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => handleTagClick(tag.name)}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 border flex items-center gap-2",
                tagName === tag.name
                  ? "bg-foreground text-background border-foreground shadow-lg shadow-foreground/10"
                  : "bg-background text-muted-foreground border-border hover:border-foreground/40 hover:text-foreground",
              )}
            >
              <span>{tag.name}</span>
              <span
                className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded-full transition-colors",
                  tagName === tag.name
                    ? "bg-background/20 text-background"
                    : "bg-muted text-muted-foreground group-hover:bg-muted-foreground/10",
                )}
              >
                {tag.postCount}
              </span>
            </button>
          ))}
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
