import ZoomableImage from "./zoomable-image";

export function ImageDisplay({ src, alt }: { src: string; alt: string }) {
	return (
		<div className="my-16 group relative space-y-4">
			<div className="relative bg-zinc-50/50 dark:bg-zinc-900/20 rounded-sm overflow-hidden transition-all duration-700 border border-zinc-100 dark:border-zinc-900 group-hover:border-zinc-200 dark:group-hover:border-zinc-800 p-2">
				<ZoomableImage
					src={src}
					alt={alt}
					className="w-full h-auto object-cover max-h-[800px] transition-all duration-1000 scale-[1.02] group-hover:scale-100"
					showHint={true}
				/>
			</div>
			{alt && (
				<div className="flex items-center gap-4 px-2">
					<span className="text-[10px] font-mono font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.4em]">
						{alt}
					</span>
					<div className="h-px bg-zinc-100 dark:bg-zinc-800 flex-1"></div>
				</div>
			)}
		</div>
	);
}
