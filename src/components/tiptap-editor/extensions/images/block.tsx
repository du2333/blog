import type { NodeViewProps } from "@tiptap/react";
import { NodeViewWrapper } from "@tiptap/react";
import { Loader2, UploadCloud } from "lucide-react";
import { useMemo } from "react";

export function ImageBlock({
	node,
	updateAttributes,
	selected,
}: NodeViewProps) {
	const src = node.attrs.src;
	const isUploading = useMemo(() => src?.startsWith("blob:"), [src]);

	return (
		<NodeViewWrapper className="my-16 group relative image-node-view">
			<div
				className={`
            relative overflow-hidden transition-all duration-700 rounded-sm border
            ${
							selected
								? "border-zinc-900 dark:border-zinc-100 shadow-2xl scale-[1.01]"
								: "border-zinc-100 dark:border-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700"
						}
            ${isUploading ? "border-dashed opacity-50" : ""}
        `}
			>
				<div className="relative">
					<img
						src={src}
						alt={node.attrs.alt}
						className={`w-full h-auto object-cover max-h-[800px] transition-all duration-1000 ${
							isUploading ? "blur-sm grayscale" : "opacity-100"
						} ${selected ? "scale-105" : "group-hover:scale-102"}`}
					/>

					{/* Uploading Overlay */}
					{isUploading && (
						<div className="absolute inset-0 flex flex-col items-center justify-center z-10">
							<div className="bg-white/80 dark:bg-black/80 backdrop-blur-xl p-6 rounded-sm flex flex-col items-center gap-4 shadow-2xl border border-zinc-100 dark:border-white/5">
								<Loader2
									className="text-zinc-900 dark:text-zinc-100 animate-spin"
									size={24}
								/>
								<div className="text-[10px] font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-[0.3em] flex items-center gap-3">
									<UploadCloud size={14} /> Processing Asset
								</div>
							</div>
						</div>
					)}
				</div>
			</div>

			<div className="mt-4 flex items-center gap-4">
				<div className="h-px bg-zinc-100 dark:bg-zinc-900 flex-1"></div>
				<input
					type="text"
					value={node.attrs.alt || ""}
					onChange={(e) => updateAttributes({ alt: e.target.value })}
					placeholder={isUploading ? "Processing..." : "Describe this image..."}
					disabled={isUploading}
					className="bg-transparent text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-400 focus:text-zinc-950 dark:focus:text-zinc-50 focus:outline-none w-48 md:w-64 placeholder:text-zinc-200 dark:placeholder:text-zinc-800 text-right transition-colors disabled:opacity-50"
				/>
			</div>
		</NodeViewWrapper>
	);
}
