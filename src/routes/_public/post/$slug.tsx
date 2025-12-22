import { useSuspenseQuery } from "@tanstack/react-query";
import {
	ClientOnly,
	createFileRoute,
	notFound,
	useRouter,
} from "@tanstack/react-router";
import { ArrowLeft, ArrowUp, Calendar, Clock, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { ContentRenderer } from "@/components/article/content-renderer";
import TableOfContents from "@/components/article/table-of-content";
import { ArticleSkeleton } from "@/components/skeletons/article-skeleton";
import { postBySlugQuery } from "@/features/posts/posts.query";
import { formatDate } from "@/lib/utils";

export const Route = createFileRoute("/_public/post/$slug")({
	component: RouteComponent,
	loader: async ({ context, params }) => {
		const post = await context.queryClient.ensureQueryData(
			postBySlugQuery(params.slug),
		);
		if (!post) {
			throw notFound();
		}
		return post;
	},
	head: ({ loaderData: post }) => ({
		meta: [
			{
				title: post?.title,
			},
			{
				name: "description",
				content: post?.summary ?? "",
			},
		],
	}),
	pendingComponent: ArticleSkeleton,
});

function RouteComponent() {
	const { data: post } = useSuspenseQuery(
		postBySlugQuery(Route.useParams().slug),
	);
	const router = useRouter();
	const [showBackToTop, setShowBackToTop] = useState(false);

	useEffect(() => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	}, []);

	useEffect(() => {
		const handleScroll = () => {
			setShowBackToTop(window.scrollY > 400);
		};
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	if (!post) throw notFound();

	return (
		<div className="w-full max-w-7xl mx-auto pb-32 px-6 md:px-12">
			{/* Back Link */}
			<nav className="py-12 animate-in fade-in duration-700 max-w-4xl">
				<button
					onClick={() => router.history.back()}
					className="group flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors"
				>
					<ArrowLeft
						size={14}
						className="group-hover:-translate-x-1 transition-transform"
					/>
					<span>返回列表</span>
				</button>
			</nav>

			<article className="space-y-16">
				{/* Header Section */}
				<header className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out fill-mode-forwards max-w-4xl">
					<div className="space-y-6">
						<div className="flex flex-wrap items-center gap-6 text-[10px] font-mono tracking-[0.2em] uppercase text-zinc-500 dark:text-zinc-500">
							<span className="px-2 py-0.5 border border-zinc-200 dark:border-zinc-800 rounded-sm">
								{post.category}
							</span>
							<span className="flex items-center gap-1.5">
								<Calendar size={12} strokeWidth={1.5} />
								<ClientOnly fallback={<span>-</span>}>
									{formatDate(post.publishedAt)}
								</ClientOnly>
							</span>
							<span className="flex items-center gap-1.5">
								<Clock size={12} strokeWidth={1.5} />
								{post.readTimeInMinutes} min
							</span>
						</div>

						<h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-medium leading-[1.1] tracking-tight text-zinc-950 dark:text-zinc-50">
							{post.title}
						</h1>
					</div>

					<p className="text-xl md:text-2xl font-normal leading-relaxed text-zinc-500 dark:text-zinc-400 border-l border-zinc-200 dark:border-zinc-800 pl-8 italic">
						{post.summary}
					</p>
				</header>

				{/* Content Layout */}
				<div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-20 items-start">
					<main className="min-w-0 max-w-3xl prose prose-zinc dark:prose-invert prose-lg md:prose-xl animate-in fade-in duration-1000 delay-300 fill-mode-both text-zinc-800 dark:text-zinc-200 leading-relaxed">
						<ContentRenderer content={post.contentJson} />

						<footer className="mt-32 pt-12 border-t border-zinc-100 dark:border-zinc-900 flex justify-end items-center">
							<button className="group flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors">
								<Share2 size={14} strokeWidth={1.5} />
								<span>分享文章</span>
							</button>
						</footer>
					</main>

					{/* Table of Contents Sidebar */}
					<aside className="hidden lg:block sticky top-32 animate-in fade-in duration-1000 delay-500 fill-mode-forwards">
						<div className="pl-8 border-l border-zinc-100 dark:border-zinc-900">
							<TableOfContents headers={post.toc} />
						</div>
					</aside>
				</div>
			</article>

			{/* Back To Top */}
			<div
				className={`fixed bottom-12 right-12 z-40 transition-all duration-700 ${
					showBackToTop
						? "opacity-100 translate-y-0"
						: "opacity-0 translate-y-10 pointer-events-none"
				}`}
			>
				<button
					onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
					className="w-12 h-12 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center hover:bg-zinc-900 dark:hover:bg-white hover:text-white dark:hover:text-zinc-900 transition-all duration-500 group"
				>
					<ArrowUp
						size={20}
						className="group-hover:-translate-y-1 transition-transform"
					/>
				</button>
			</div>
		</div>
	);
}
