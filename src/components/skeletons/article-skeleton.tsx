import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export function ArticleSkeleton() {
	const navigate = useNavigate();

	return (
		<div className="w-full max-w-7xl mx-auto pb-32 px-6 md:px-10">
			{/* Back Link Skeleton */}
			<nav className="py-12 animate-pulse max-w-3xl">
				<button
					onClick={() => navigate({ to: "/database" })}
					className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] opacity-40 hover:opacity-100 transition-opacity"
				>
					<ArrowLeft size={12} />
					<span>返回目录</span>
				</button>
			</nav>

			<div className="space-y-20">
				{/* Header Section Skeleton */}
				<header className="space-y-12 max-w-3xl">
					<div className="space-y-6">
						<div className="flex items-center gap-4">
							<div className="h-4 w-16 bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded-sm"></div>
							<div className="h-4 w-24 bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded-sm"></div>
							<div className="h-4 w-20 bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded-sm"></div>
						</div>

						<div className="space-y-4">
							<div className="h-16 md:h-24 lg:h-32 w-full bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded-sm"></div>
							<div className="h-16 md:h-24 lg:h-32 w-4/5 bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded-sm"></div>
						</div>
					</div>

					<div className="border-l border-zinc-100 dark:border-zinc-900 pl-8 space-y-3">
						<div className="h-6 w-full bg-zinc-50 dark:bg-zinc-900/50 animate-pulse rounded-sm"></div>
						<div className="h-6 w-5/6 bg-zinc-50 dark:bg-zinc-900/50 animate-pulse rounded-sm"></div>
					</div>
				</header>

				{/* Content Layout Skeleton */}
				<div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-20 items-start">
					<main className="space-y-12 max-w-3xl">
						{/* Content Blocks */}
						<div className="space-y-8">
							{[1, 2, 3].map((i) => (
								<div key={i} className="space-y-4">
									<div className="h-4 w-full bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded-sm"></div>
									<div className="h-4 w-full bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded-sm"></div>
									<div className="h-4 w-11/12 bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded-sm"></div>
									<div className="h-4 w-full bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded-sm"></div>
									<div className="h-4 w-4/5 bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded-sm"></div>

									{i === 2 && (
										<div className="my-16 h-96 w-full bg-zinc-50 dark:bg-zinc-900 animate-pulse rounded-sm"></div>
									)}
								</div>
							))}
						</div>

						{/* Footer Skeleton */}
						<footer className="mt-32 pt-12 border-t border-zinc-100 dark:border-zinc-900 flex justify-between items-center">
							<div className="h-4 w-48 bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded-sm"></div>
							<div className="h-4 w-24 bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded-sm"></div>
						</footer>
					</main>

					{/* Table of Contents Sidebar Skeleton */}
					<aside className="hidden lg:block sticky top-32 pl-8 border-l border-zinc-100 dark:border-zinc-900">
						<div className="space-y-8 animate-pulse">
							<div className="h-4 w-20 bg-zinc-100 dark:bg-zinc-900 rounded-sm"></div>
							<div className="space-y-4">
								<div className="h-3 w-full bg-zinc-100 dark:bg-zinc-900 rounded-sm"></div>
								<div className="h-3 w-4/5 bg-zinc-100 dark:bg-zinc-900 rounded-sm"></div>
								<div className="h-3 w-full bg-zinc-100 dark:bg-zinc-900 rounded-sm"></div>
								<div className="h-3 w-2/3 bg-zinc-100 dark:bg-zinc-900 rounded-sm"></div>
								<div className="h-3 w-3/4 bg-zinc-100 dark:bg-zinc-900 rounded-sm"></div>
							</div>
						</div>
					</aside>
				</div>
			</div>
		</div>
	);
}
