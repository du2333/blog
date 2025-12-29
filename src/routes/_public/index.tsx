import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PostItem } from "@/components/article/post-item";
import { LoadingFallback } from "@/components/common/loading-fallback";
import { featuredPostsQuery } from "@/features/posts/posts.query";
import { cn } from "@/lib/utils";

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
			<section className="min-h-[70vh] flex flex-col justify-center py-20 md:py-32 border-b border-border">
				<div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both">
					<header className="space-y-4">
						<div className="flex items-center gap-3">
							<span className="h-0.5 w-12 bg-foreground"></span>
						</div>
						<h1 className="text-6xl md:text-9xl font-serif font-medium leading-[0.9] tracking-tight text-foreground">
							数字
							{" "}
							<br />
							<span className="text-muted-foreground/50">生活</span>
						</h1>
					</header>

					<div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
						<p className="max-w-xl text-lg md:text-xl font-normal leading-relaxed text-muted-foreground">
							探索科技与生活的交汇点。在这里记录我的思考、技术心得与数字记忆。
						</p>

						<div className="pt-4">
							<Link
								to="/blog"
								className="group inline-flex items-center gap-4 text-sm font-bold uppercase tracking-widest hover:gap-6 transition-all duration-500"
							>
								<span>阅读文章</span>
								<div className="w-12 h-12 rounded-full border border-border flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
									<ArrowRight size={18} strokeWidth={1.5} />
								</div>
							</Link>
						</div>
					</div>
				</div>
			</section>

			{/* Latest Stories - Clean List */}
			<section className="py-24 md:py-40">
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-20 md:mb-32">
					<div className="space-y-6">
						<div className="flex items-center gap-4">
							<span className="h-px w-10 bg-foreground/20"></span>
							<span className="text-[10px] uppercase tracking-[0.5em] text-muted-foreground font-bold font-mono">
								Recent Publication
							</span>
						</div>
						<h2 className="text-6xl md:text-8xl font-serif font-medium text-foreground tracking-tighter leading-none">
							最新发布
						</h2>
					</div>
					<Link
						to="/blog"
						className="group flex items-center gap-4 text-[11px] uppercase tracking-[0.3em] font-bold text-muted-foreground hover:text-foreground transition-all duration-700 md:pb-2"
					>
						<span className="border-b border-border group-hover:border-foreground transition-colors pb-1">
							浏览全部内容
						</span>
						<ArrowRight size={14} className="group-hover:translate-x-2 transition-transform duration-500" />
					</Link>
				</div>

				<div className="flex flex-col gap-0 border-t border-border">
					{posts.map((post, index) => (
						<PostItem key={post.id} post={post} index={index} />
					))}
				</div>
			</section>
		</div>
	);
}
