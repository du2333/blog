import { FolderOpen, Terminal } from "lucide-react";
import { POST_CATEGORIES } from "@/lib/db/schema";

interface PostSidebarProps {
	activeCategory: string;
	onSelectCategory: (category: string) => void;
}

export function PostSidebar({
	activeCategory,
	onSelectCategory,
}: PostSidebarProps) {
	return (
		<aside className="hidden lg:block sticky top-24 w-64 shrink-0">
			<div className="bg-zzz-black border-l-2 border-zzz-gray py-4 pl-6 relative">
				<div className="flex items-center gap-2 mb-8 text-zzz-gray text-xs font-bold font-mono uppercase tracking-widest">
					<Terminal size={14} /> Directory_Tree
				</div>

				<nav className="space-y-2">
					{["ALL", ...POST_CATEGORIES].map((cat) => {
						const isActive = activeCategory === cat;

						return (
							<button
								key={cat}
								onClick={() => onSelectCategory(cat)}
								className={`
                            group w-full flex items-center justify-between py-3 pr-4 transition-all duration-300 border-b border-dashed border-zzz-gray/20 hover:pl-4
                            ${isActive ? "pl-4" : ""}
                        `}
							>
								<div className="flex items-center gap-3">
									<div
										className={`
                                w-1.5 h-1.5 transform rotate-45 transition-all duration-300
                                ${
																	isActive
																		? "bg-zzz-lime scale-150"
																		: "bg-gray-700 group-hover:bg-white"
																}
                            `}
									></div>
									<span
										className={`
                                text-sm font-bold font-sans uppercase tracking-wider transition-colors
                                ${
																	isActive
																		? "text-white"
																		: "text-gray-500 group-hover:text-white"
																}
                            `}
									>
										{cat}
									</span>
								</div>

								{isActive && (
									<FolderOpen
										size={14}
										className="text-zzz-lime animate-in fade-in slide-in-from-left-2"
									/>
								)}
							</button>
						);
					})}
				</nav>

				{/* Decorative Footer in Sidebar */}
				<div className="mt-12 p-4 bg-zzz-dark border border-zzz-gray/50 clip-corner-bl opacity-80">
					<div className="text-[10px] font-mono text-zzz-orange mb-1">
						SYSTEM_NOTICE
					</div>
					<p className="text-[10px] text-gray-500 leading-relaxed">
						Older logs may be partially corrupted by Hollow interference. Use
						decryption tools if necessary.
					</p>
				</div>

				{/* Decor Line */}
				<div className="absolute top-0 bottom-0 -left-0.5 w-0.5 bg-linear-to-b from-transparent via-zzz-lime to-transparent opacity-50"></div>
			</div>
		</aside>
	);
}
