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
								? "border-foreground shadow-2xl scale-[1.01]"
								: "border-border hover:border-border"
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
							<div className="bg-popover/80 backdrop-blur-xl p-6 rounded-sm flex flex-col items-center gap-4 shadow-2xl border border-border">
								<Loader2 className="animate-spin" size={24} />
								<div className="text-[10px] font-bold uppercase tracking-[0.3em] flex items-center gap-3">
									<UploadCloud size={14} /> Processing Asset
								</div>
							</div>
						</div>
					)}
				</div>
			</div>

			<div className="mt-4 flex items-center gap-4">
				<div className="h-px bg-border flex-1"></div>
				<input
					type="text"
					value={node.attrs.alt || ""}
					onChange={(e) => updateAttributes({ alt: e.target.value })}
					placeholder={isUploading ? "Processing..." : "Describe this image..."}
					disabled={isUploading}
					className="bg-transparent text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground focus:text-foreground focus:outline-none w-48 md:w-64 placeholder:text-muted-foreground text-right transition-colors disabled:opacity-50"
				/>
			</div>
		</NodeViewWrapper>
	);
}
