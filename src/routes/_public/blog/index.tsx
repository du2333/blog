import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { z } from "zod";
import { PostItem } from "@/components/article/post-item";
import { LoadingFallback } from "@/components/common/loading-fallback";
import { postsInfiniteQueryOptions } from "@/features/posts/posts.query";
import type { PostCategory } from "@/lib/db/schema";

const searchSchema = z.object({
	category: z.custom<PostCategory>().optional().catch(undefined),
});

export const Route = createFileRoute("/_public/blog/")({
	component: RouteComponent,
	pendingComponent: LoadingFallback,
	validateSearch: searchSchema,
	loaderDeps: ({ search: { category } }) => ({ category }),
	loader: async ({ context, deps: { category } }) => {
		await context.queryClient.prefetchInfiniteQuery(
			postsInfiniteQueryOptions(category),
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
				to: "/blog",
				search: cat === "ALL" ? {} : { category: cat as PostCategory },
			});
			window.scrollTo({ top: 0, behavior: "smooth" });
		},
		[navigate],
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
			{ threshold: 0.1, rootMargin: "0px" },
		);

		if (observerRef.current) {
			observer.observe(observerRef.current);
		}

		return () => observer.disconnect();
	}, [hasNextPage, isFetchingNextPage, fetchNextPage]);

	const categories: { label: string; value: string }[] = [
		{ label: "全部内容", value: "ALL" },
		{ label: "开发日志", value: "DEV" },
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
					<h1 className="text-6xl md:text-9xl font-serif font-medium leading-[0.9] tracking-tight text-zinc-950 dark:text-zinc-50">
						文章
					</h1>
					<p className="max-w-xl text-lg md:text-xl font-normal leading-relaxed text-zinc-500 dark:text-zinc-500">
						按时间顺序排列的文章记录。从技术深度到艺术探索，每一个数字片段都在此汇聚。
					</p>
				</div>

				{/* Categories Filter */}
				<nav className="flex flex-wrap gap-x-8 gap-y-4 border-b border-zinc-100 dark:border-zinc-900 pb-8 animate-in fade-in duration-1000 delay-300 fill-mode-both">
					{categories.map((cat) => (
						<button
							key={cat.value}
							onClick={() => handleCategoryChange(cat.value)}
							className={`text-[11px] uppercase tracking-[0.2em] transition-all duration-500 relative group font-medium ${
								activeCategory === cat.value
									? "text-zinc-950 dark:text-zinc-50"
									: "text-zinc-400 dark:text-zinc-600 hover:text-zinc-950 dark:hover:text-zinc-100"
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
					<PostItem key={post.id} post={post} index={index} />
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
