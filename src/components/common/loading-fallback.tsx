export function LoadingFallback() {
	return (
		<div className="w-full max-w-7xl mx-auto px-6 md:px-10 py-20 space-y-24">
			{/* Hero Skeleton */}
			<div className="min-h-[60vh] flex flex-col justify-center space-y-8">
				<div className="space-y-4">
					<div className="h-4 w-32 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded"></div>
					<div className="h-20 w-3/4 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded"></div>
					<div className="h-20 w-1/2 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded"></div>
				</div>
				<div className="h-6 w-2/3 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded"></div>
				<div className="h-12 w-40 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-full"></div>
			</div>

			{/* List Skeleton */}
			<div className="flex flex-col border-t border-black/5 dark:border-white/10">
				{[1, 2, 3, 4].map((i) => (
					<div
						key={i}
						className="grid grid-cols-1 md:grid-cols-12 gap-6 py-12 border-b border-black/5 dark:border-white/10"
					>
						<div className="md:col-span-1 h-4 w-8 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded"></div>
						<div className="md:col-span-7 space-y-4">
							<div className="h-12 w-3/4 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded"></div>
							<div className="h-4 w-full bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded"></div>
						</div>
						<div className="md:col-span-4 flex flex-col md:items-end justify-between py-2">
							<div className="h-3 w-24 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded"></div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
