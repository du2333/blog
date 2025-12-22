import { ClientOnly, Link } from "@tanstack/react-router";
import { ArrowUpRight, Clock, Cpu, HardDrive } from "lucide-react";
import { CATEGORY_COLORS } from "@/lib/constants";
import type { PostCategory } from "@/lib/db/schema";
import { formatDate } from "@/lib/utils";

interface PostFeedItem {
	id: number;
	title: string;
	summary: string | null;
	readTimeInMinutes: number;
	slug: string;
	category: PostCategory;
	publishedAt: Date | null;
}

export function PostFeed({ posts }: { posts: PostFeedItem[] }) {
	return (
		<div className="space-y-4 relative min-h-[50vh]">
			{/* Desktop Header Row */}
			<div className="hidden md:grid grid-cols-12 gap-6 px-8 py-2 text-[10px] font-mono text-gray-600 font-bold uppercase tracking-widest border-b border-zzz-gray mb-2 select-none">
				<div className="col-span-1 text-center">ID_Tag</div>
				<div className="col-span-8 pl-4">
					Entry_Data (Subject / Classification)
				</div>
				<div className="col-span-3 text-right pr-4">Meta_State</div>
			</div>

			{posts.map((post, index) => (
				<Link
					key={`${post.id}-${index}`}
					to={"/post/$slug"}
					params={{ slug: post.slug }} // Handle virtual IDs
					className="group relative block"
				>
					{/* Desktop Layout - Softer Contrast Version */}
					<div className="hidden md:grid grid-cols-12 gap-6 px-0 py-0 bg-[#111] border border-zzz-gray/40 items-stretch transition-all duration-300 hover:bg-[#161616] hover:border-zzz-lime/50 relative overflow-hidden clip-corner-bl min-h-[140px]">
						{/* Background Pattern for texture (reduces solid block feel) */}
						<div className="absolute inset-0 bg-stripe-pattern opacity-[0.03] pointer-events-none"></div>

						{/* ID Column (Vertical Strip) - Darker background for hierarchy */}
						<div className="col-span-1 bg-black/40 border-r border-zzz-gray/20 flex flex-col items-center justify-center gap-2 py-4 relative z-10">
							<HardDrive
								size={16}
								className="text-gray-600 group-hover:text-zzz-cyan transition-colors"
							/>
							<div className="font-mono text-[9px] text-gray-600 group-hover:text-gray-500 [writing-mode:vertical-rl] rotate-180 tracking-widest uppercase opacity-70 transition-colors">
								LOG_{post.slug.substring(0, 6)}
							</div>
						</div>

						{/* Content Column (Main Info) */}
						<div className="col-span-8 py-6 pl-4 pr-8 flex flex-col justify-center border-r border-zzz-gray/10 relative z-10">
							{/* Top Meta: Category + Date - Softer colors */}
							<div className="flex items-center gap-3 mb-3">
								<span
									className={`inline-block px-2 py-0.5 text-[9px] border ${
										CATEGORY_COLORS[post.category]
									} font-bold uppercase tracking-wider bg-black/20`}
								>
									{post.category}
								</span>
								<span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest flex items-center gap-1">
									<span className="w-1 h-1 bg-gray-600 rounded-full"></span>
									<ClientOnly fallback={<span>-</span>}>
										{formatDate(post.publishedAt)}
									</ClientOnly>
								</span>
							</div>

							{/* Main Title - Fix: Changed leading-none to leading-tight and added py-1 to prevent truncation of Chinese characters */}
							<h3 className="font-sans font-black text-2xl text-gray-200 uppercase truncate mb-3 group-hover:text-zzz-lime transition-colors leading-tight tracking-tight py-1">
								{post.title}
							</h3>

							{/* Summary - Medium gray text */}
							<p className="text-sm text-gray-400 font-mono line-clamp-2 leading-relaxed max-w-3xl group-hover:text-gray-300 transition-colors">
								{post.summary}
							</p>
						</div>

						{/* Action/Meta Column (Right Side) */}
						<div className="col-span-3 flex flex-col items-end justify-center gap-6 pr-8 py-6 bg-linear-to-l from-black/20 to-transparent relative z-10">
							{/* Stats - Muted colors */}
							<div className="flex gap-6 opacity-60 group-hover:opacity-100 transition-opacity">
								<div className="flex flex-col items-end">
									<span className="text-[9px] font-mono text-gray-600 uppercase tracking-wider">
										READ_TIME
									</span>
									<span className="text-xs font-bold font-mono text-gray-300 flex items-center gap-1">
										<Clock size={10} className="text-zzz-lime/70" />{" "}
										{post.readTimeInMinutes} MINS
									</span>
								</div>
								<div className="flex flex-col items-end">
									<span className="text-[9px] font-mono text-gray-600 uppercase tracking-wider">
										INTEGRITY
									</span>
									<span className="text-xs font-bold font-mono text-zzz-cyan/80">
										100%
									</span>
								</div>
							</div>

							{/* Access Button - Less aggressive styling */}
							<div className="flex items-center gap-2 text-xs font-bold font-sans uppercase text-zzz-lime/80 group-hover:translate-x-1 transition-transform cursor-pointer bg-zzz-lime/5 px-4 py-2 border border-zzz-lime/20 group-hover:bg-zzz-lime group-hover:text-black group-hover:border-zzz-lime">
								Access Log <ArrowUpRight size={14} />
							</div>
						</div>

						{/* Hover Decorator - Left Bar */}
						<div className="absolute left-0 top-0 bottom-0 w-1 bg-zzz-lime transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-bottom"></div>
					</div>

					{/* Mobile Layout (Card) */}
					<div className="md:hidden bg-zzz-dark border border-zzz-gray p-5 flex flex-col gap-4 relative overflow-hidden clip-corner-tr active:scale-[0.98] transition-transform">
						<div className="flex justify-between items-start">
							<span
								className={`text-[10px] px-2 py-1 border ${
									CATEGORY_COLORS[post.category]
								} font-bold`}
							>
								{post.category}
							</span>
							<span className="font-mono text-[10px] text-gray-500">
								<ClientOnly fallback={<span>-</span>}>
									{formatDate(post.publishedAt)}
								</ClientOnly>
							</span>
						</div>

						<div>
							<h3 className="text-xl font-bold font-sans text-white uppercase leading-tight mb-2">
								{post.title}
							</h3>
							<p className="text-xs text-gray-400 font-mono line-clamp-2 leading-relaxed">
								{post.summary}
							</p>
						</div>

						<div className="pt-3 border-t border-dashed border-zzz-gray flex justify-between items-center mt-1">
							<span className="text-[10px] font-mono text-zzz-cyan flex items-center gap-1">
								<Cpu size={12} /> ID: {post.slug.substring(0, 8)}...
							</span>
							<div className="flex items-center gap-1 text-zzz-lime text-xs font-bold uppercase">
								Open <ArrowUpRight size={14} />
							</div>
						</div>
					</div>
				</Link>
			))}
		</div>
	);
}
