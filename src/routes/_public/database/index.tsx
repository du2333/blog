import { LoadingFallback } from "@/components/common/loading-fallback";
import { postsInfiniteQueryOptions } from "@/features/posts/posts.query";
import { PostCategory } from "@/lib/db/schema";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Clock, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef } from "react";
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

  const activeCategory = category ?? "ALL";

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

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery(postsInfiniteQueryOptions(category));

  const posts = useMemo(() => {
    return data?.pages.flatMap((page) => page.items) ?? [];
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
      { threshold: 0.1, rootMargin: "0px" }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const categories: { label: string; value: string }[] = [
    { label: "全部内容", value: "ALL" },
    { label: "开发日志", value: "DEV" },
    { label: "设计思考", value: "DESIGN" },
    { label: "生活碎念", value: "LIFE" },
    { label: "技术探索", value: "TECH" },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto pb-32 px-6 md:px-10">
      {/* Header Section */}
      <header className="py-20 md:py-32 space-y-12">
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 fill-mode-forwards">
          <div className="flex items-center gap-3">
            <span className="h-px w-12 bg-black dark:bg-white/40"></span>
          </div>
          <h1 className="text-6xl md:text-9xl font-serif font-medium leading-[0.9] tracking-tight">
            文章
          </h1>
          <p className="max-w-xl text-lg md:text-xl font-light leading-relaxed opacity-60">
            按时间顺序排列的文章记录。从技术深度到艺术探索，每一个数字片段都在此汇聚。
          </p>
        </div>

        {/* Categories Filter */}
        <nav className="flex flex-wrap gap-x-8 gap-y-4 border-b border-zinc-100 dark:border-zinc-900 pb-8 animate-in fade-in duration-1000 delay-300 fill-mode-both">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => handleCategoryChange(cat.value)}
              className={`text-[11px] uppercase tracking-[0.2em] transition-all duration-500 relative group ${
                activeCategory === cat.value
                  ? "text-zinc-900 dark:text-zinc-100 font-bold"
                  : "text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              {cat.label}
              <span
                className={`absolute -bottom-2 left-0 h-px bg-current transition-all duration-500 ${
                  activeCategory === cat.value
                    ? "w-full"
                    : "w-0 group-hover:w-full"
                }`}
              ></span>
            </button>
          ))}
        </nav>
      </header>

      {/* Posts List */}
      <div className="flex flex-col gap-0 border-t border-zinc-100 dark:border-white/10">
        {posts.map((post, index) => (
          <Link
            key={post.id}
            to="/post/$slug"
            params={{ slug: post.slug }}
            className="group grid grid-cols-1 md:grid-cols-12 gap-6 py-12 border-b border-zinc-100 dark:border-white/10 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors duration-500 px-4 -mx-4"
          >
            <div className="md:col-span-1 text-[10px] font-mono opacity-30 mt-2">
              {(index + 1).toString().padStart(2, "0")}
            </div>

            <div className="md:col-span-7 space-y-4">
              <h3 className="text-3xl md:text-5xl font-serif leading-tight group-hover:translate-x-2 transition-transform duration-700">
                {post.title}
              </h3>
              <p className="text-sm md:text-base opacity-50 max-w-2xl font-light leading-relaxed line-clamp-2">
                {post.summary}
              </p>
            </div>

            <div className="md:col-span-4 flex flex-col md:items-end justify-between py-2">
              <div className="flex items-center gap-4 text-[10px] font-mono tracking-widest uppercase opacity-40">
                <span>{post.category}</span>
                <span className="w-1 h-1 rounded-full bg-current"></span>
                <span className="flex items-center gap-1">
                  <Clock size={10} /> {post.readTimeInMinutes} min
                </span>
              </div>
              <div className="hidden md:flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                阅读全文 <ArrowRight size={12} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Load More Area & Infinite Scroll Observer */}
      <div
        ref={observerRef}
        className="py-20 flex flex-col items-center justify-center gap-6"
      >
        {isFetchingNextPage ? (
          <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border border-zinc-100 dark:border-zinc-800 flex items-center justify-center">
                <RefreshCw size={16} className="text-zinc-400 animate-spin" />
              </div>
              <div className="absolute inset-0 w-12 h-12 rounded-full border-t border-zinc-900 dark:border-zinc-100 animate-[spin_1.5s_linear_infinite]"></div>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-zinc-400">
              Loading
            </span>
          </div>
        ) : hasNextPage ? (
          <div className="h-px w-24 bg-zinc-100 dark:bg-zinc-800"></div>
        ) : posts.length > 0 ? (
          <div className="flex flex-col items-center gap-3 opacity-20">
            <div className="h-px w-32 bg-current"></div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
