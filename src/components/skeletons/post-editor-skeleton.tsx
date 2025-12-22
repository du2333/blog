export function PostEditorSkeleton() {
	return (
		<div className="fixed inset-0 z-80 flex flex-col bg-white dark:bg-[#050505] overflow-hidden animate-pulse">
			{/* Header Skeleton */}
			<header className="h-20 flex items-center justify-between px-8 shrink-0 bg-white/80 dark:bg-[#050505]/80 backdrop-blur-md border-b border-zinc-100/50 dark:border-white/5">
				<div className="flex items-center gap-2">
					<div className="w-10 h-10 bg-zinc-50 dark:bg-zinc-900 rounded-full" />
					<div className="w-12 h-3 bg-zinc-50 dark:bg-zinc-900 rounded-sm opacity-20" />
				</div>
				<div className="flex items-center gap-3">
					<div className="w-28 h-10 bg-zinc-50 dark:bg-zinc-900 rounded-full" />
					<div className="w-28 h-10 bg-zinc-50 dark:bg-zinc-900 rounded-full" />
				</div>
			</header>

			{/* Main Content Skeleton */}
			<div className="flex-1 overflow-y-auto py-20">
				<div className="max-w-3xl mx-auto space-y-20 px-6 md:px-0">
					{/* Title Placeholder */}
					<div className="space-y-4">
						<div className="h-16 w-3/4 bg-zinc-50 dark:bg-zinc-900 rounded-sm" />
						<div className="h-16 w-1/2 bg-zinc-50 dark:bg-zinc-900 rounded-sm opacity-50" />
					</div>

					{/* Properties Placeholder */}
					<div className="py-8 border-y border-zinc-50 dark:border-white/2 space-y-4">
						{[1, 2, 3, 4, 5].map((i) => (
							<div key={i} className="flex items-center gap-8 px-2">
								<div className="w-32 h-4 bg-zinc-50 dark:bg-zinc-900 rounded-sm" />
								<div className="flex-1 h-4 bg-zinc-50 dark:bg-zinc-900 rounded-sm opacity-40" />
							</div>
						))}
					</div>

					{/* Content Area Placeholder */}
					<div className="space-y-10">
						{[1, 2, 3].map((i) => (
							<div key={i} className="space-y-4">
								<div className="h-4 w-full bg-zinc-50 dark:bg-zinc-900 rounded-sm opacity-40" />
								<div className="h-4 w-[95%] bg-zinc-50 dark:bg-zinc-900 rounded-sm opacity-30" />
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
