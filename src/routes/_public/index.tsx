import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PostItem } from "@/components/article/post-item";
import { LoadingFallback } from "@/components/common/loading-fallback";
import { featuredPostsQuery } from "@/features/posts/posts.query";

export const Route = createFileRoute("/_public/")({
	component: App,
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData(featuredPostsQuery);
	},
	pendingComponent: LoadingFallback,
});

function App() {
	const { data: posts } = useSuspenseQuery(featuredPostsQuery);

	return (
		<div className="flex flex-col w-full max-w-7xl mx-auto px-6 md:px-12">
			{/* Hero Section - Minimalist & Bold */}
			<section className="min-h-[70vh] flex flex-col justify-center py-20 md:py-32 border-b border-zinc-100 dark:border-zinc-900">
				<div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out fill-mode-forwards">
					<header className="space-y-4">
						<div className="flex items-center gap-3">
							<span className="h-0.5 w-12 bg-zinc-950 dark:bg-zinc-50"></span>
						</div>
						<h1 className="text-6xl md:text-9xl font-serif font-medium leading-[0.9] tracking-tight text-zinc-950 dark:text-zinc-50">
							数字 <br />
							<span className="text-zinc-400 dark:text-zinc-600">生活</span>
						</h1>
					</header>

					<div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
						<p className="max-w-xl text-lg md:text-xl font-normal leading-relaxed text-zinc-600 dark:text-zinc-400">
							探索科技与生活的交汇点。在这里记录我的思考、技术心得与数字记忆。
						</p>

						<div className="pt-4">
							<Link
								to="/blog"
								className="group inline-flex items-center gap-4 text-sm font-bold uppercase tracking-widest hover:gap-6 transition-all duration-500"
							>
								<span>阅读文章</span>
								<div className="w-12 h-12 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center group-hover:bg-zinc-950 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-zinc-950 transition-all duration-500">
									<ArrowRight size={18} strokeWidth={1.5} />
								</div>
							</Link>
						</div>
					</div>
				</div>
			</section>

			{/* Latest Stories - Clean List */}
			<section className="py-24 md:py-32">
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
					<div className="space-y-2">
						<h2 className="text-4xl md:text-5xl font-serif font-medium text-zinc-950 dark:text-zinc-50">
							最新发布
						</h2>
					</div>
					<Link
						to="/blog"
						className="text-[11px] uppercase tracking-[0.2em] font-bold text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors pb-1 border-b border-zinc-200 dark:border-zinc-800 hover:border-zinc-950 dark:hover:border-zinc-100"
					>
						浏览全部内容
					</Link>
				</div>

				<div className="flex flex-col gap-0 border-t border-zinc-100 dark:border-zinc-900">
					{posts.map((post, index) => (
						<PostItem key={post.id} post={post} index={index} />
					))}
				</div>
			</section>
		</div>
	);
}
