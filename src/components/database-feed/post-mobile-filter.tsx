import { POST_CATEGORIES } from "@/lib/db/schema";

interface PostMobileFilterProps {
	activeCategory: string;
	onSelectCategory: (category: string) => void;
}

export function PostMobileFilter({
	activeCategory,
	onSelectCategory,
}: PostMobileFilterProps) {
	return (
		<div className="lg:hidden sticky top-20 z-30 mb-6 -mx-4 px-4 py-3 bg-zzz-black/95 backdrop-blur border-b border-zzz-gray overflow-x-auto custom-scrollbar">
			<div className="flex gap-3 min-w-max">
				{["ALL", ...POST_CATEGORIES].map((cat) => {
					const isActive = activeCategory === cat;
					return (
						<button
							key={cat}
							onClick={() => onSelectCategory(cat)}
							className={`
                        px-4 py-2 text-xs font-bold font-mono uppercase tracking-wider border clip-corner-tr transition-all active:scale-95
                        ${
													isActive
														? "bg-zzz-lime text-black border-zzz-lime"
														: "bg-black text-gray-400 border-zzz-gray hover:border-white hover:text-white"
												}
                    `}
						>
							{cat}
						</button>
					);
				})}
			</div>
		</div>
	);
}
