export function FeaturedTransmissionSkeleton() {
	return (
		<div className="w-full max-w-[1600px] mx-auto animate-pulse">
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
				{/* --- HERO SKELETON (Left / Top) --- */}
				<div className="lg:col-span-8 bg-zzz-dark border-2 border-zzz-gray/30 min-h-[500px] flex flex-col relative overflow-hidden clip-corner-tr">
					{/* Image Placeholder */}
					<div className="absolute inset-0 bg-zzz-gray/10"></div>

					<div className="relative z-10 flex-1 flex flex-col p-8 md:p-12">
						{/* Top Meta */}
						<div className="flex justify-between items-start mb-auto">
							<div className="flex items-center gap-3">
								<div className="h-5 w-24 bg-zzz-gray/20 rounded-sm"></div>
								<div className="h-5 w-16 bg-zzz-gray/10 rounded-sm"></div>
							</div>
							<div className="h-16 w-24 bg-zzz-gray/10 rounded-sm"></div>
						</div>

						{/* Title Area */}
						<div className="mt-8 md:mt-0 space-y-4">
							<div className="h-12 md:h-20 w-3/4 bg-zzz-gray/20 rounded-sm"></div>
							<div className="h-12 md:h-20 w-1/2 bg-zzz-gray/20 rounded-sm"></div>
							<div className="h-4 w-2/3 bg-zzz-gray/10 rounded-sm mt-6 border-l-2 border-zzz-gray/20 pl-4"></div>
							<div className="h-4 w-1/2 bg-zzz-gray/10 rounded-sm ml-4"></div>
						</div>

						{/* Footer */}
						<div className="mt-auto pt-8 border-t border-zzz-gray/10 flex items-center justify-between">
							<div className="h-4 w-32 bg-zzz-gray/20 rounded-sm"></div>
							<div className="h-6 w-24 bg-zzz-gray/20 rounded-sm"></div>
						</div>
					</div>
				</div>

				{/* --- SIDEBAR SKELETON (Right / Bottom) --- */}
				<div className="lg:col-span-4 flex flex-col gap-4">
					{/* Section Header */}
					<div className="h-8 bg-zzz-dark border border-zzz-gray/30 mb-2 w-full flex items-center px-4">
						<div className="h-3 w-32 bg-zzz-gray/20 rounded-sm"></div>
					</div>

					{/* List Items */}
					{[1, 2, 3].map((i) => (
						<div
							key={i}
							className="flex-1 bg-black border border-zzz-gray/30 p-5 flex flex-col justify-center gap-3 min-h-[140px] relative clip-corner-bl"
						>
							<div className="flex justify-between items-start mb-1">
								<div className="h-3 w-12 bg-zzz-gray/20 rounded-sm"></div>
								<div className="h-4 w-16 bg-zzz-gray/20 rounded-sm"></div>
							</div>

							<div className="h-6 w-full bg-zzz-gray/20 rounded-sm"></div>
							<div className="h-6 w-2/3 bg-zzz-gray/20 rounded-sm"></div>

							<div className="h-3 w-20 bg-zzz-gray/20 rounded-sm mt-2"></div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
