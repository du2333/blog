import {
  useSuspenseInfiniteQuery,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";

import { postsInfiniteQueryOptions } from "@/features/posts/queries";
import { blogConfig } from "@/blog.config";
import { LoadingFallback } from "@/components/common/loading-fallback";
import { PostItem } from "@/features/posts/components/view/post-item";
import { tagsQueryOptions } from "@/features/tags/queries";
import { cn } from "@/lib/utils";

const DisplayTagsQueryOptions = {
  ...tagsQueryOptions(),
};

export const Route = createFileRoute("/_public/posts")({
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
    return {
      title: "全部文章",
    };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.title,
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

  const [isExpanded, setIsExpanded] = useState(false);
  const INITIAL_TAG_COUNT = 8;
  const hasMoreTags = tags.length > INITIAL_TAG_COUNT;
  const visibleTags = isExpanded ? tags : tags.slice(0, INITIAL_TAG_COUNT);

  return (
    <div className="w-full max-w-3xl mx-auto pb-20 px-6 md:px-0">
      {/* Header Section */}
      <header className="py-12 md:py-20 space-y-6">
        <h1 className="text-4xl md:text-5xl font-serif font-medium tracking-tight text-foreground">
          文章
        </h1>
        <p className="max-w-xl text-base md:text-lg font-light text-muted-foreground leading-relaxed">
          {blogConfig.description}
        </p>
      </header>
      {/* Tag Filters - Minimalist Text Chips */}
      <div className="mb-12 space-y-4">
        <div className="flex items-center gap-2 text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground/50">
          <span>// 分类_筛选</span>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <button
            onClick={() => handleTagClick("")}
            className={cn(
              "text-sm font-mono transition-all duration-300 relative group",
              !tagName
                ? "text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground/80",
            )}
          >
            全部
            <span
              className={cn(
                "absolute -bottom-1 left-0 h-px bg-foreground transition-all duration-300",
                !tagName ? "w-full" : "w-0 group-hover:w-full",
              )}
            />
          </button>

          {visibleTags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => handleTagClick(tag.name)}
              className={cn(
                "text-sm font-mono transition-all duration-300 relative group flex items-baseline gap-1.5",
                tagName === tag.name
                  ? "text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground/80",
              )}
            >
              <span>{tag.name}</span>
              <span className="text-[10px] opacity-40 group-hover:opacity-70 transition-opacity">
                {tag.postCount}
              </span>
              <span
                className={cn(
                  "absolute -bottom-1 left-0 h-px bg-foreground transition-all duration-300",
                  tagName === tag.name ? "w-full" : "w-0 group-hover:w-full",
                )}
              />
            </button>
          ))}

          {hasMoreTags && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs font-mono text-muted-foreground/50 hover:text-foreground transition-colors ml-2"
            >
              {isExpanded
                ? "[- 收起]"
                : `[+ 更多 ${tags.length - INITIAL_TAG_COUNT}]`}
            </button>
          )}
        </div>
      </div>
      {/* Posts List - Clean Divide */}
      <div className="flex flex-col gap-0 border-t border-border/40">
        {posts.length === 0 ? (
          <div className="py-20 text-left">
            <p className="font-serif text-xl text-muted-foreground/50">
              暂无文章
            </p>
          </div>
        ) : (
          posts.map((post, index) => (
            // @ts-expect-error - we filter for published posts in the query
            <PostItem key={post.id} post={post} index={index} />
          ))
        )}
      </div>
      {/* Load More Area */}
      <div
        ref={observerRef}
        className="py-16 flex flex-col items-center justify-center gap-6"
      >
        {isFetchingNextPage ? (
          <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500 fill-mode-both">
            <div className="w-1.5 h-1.5 bg-foreground animate-ping" />
            <span className="text-[10px] font-mono tracking-[0.3em] text-muted-foreground uppercase">
              加载中...
            </span>
          </div>
        ) : hasNextPage ? (
          <div className="h-px w-24 bg-border/40"></div>
        ) : posts.length > 0 ? (
          <div className="flex items-center gap-4 text-muted-foreground/20">
            <span className="h-px w-12 bg-current" />
            <span className="text-lg font-serif italic">End</span>
            <span className="h-px w-12 bg-current" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
