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
    <NodeViewWrapper className="my-10 group relative image-node-view">
      <div
        className={`
            relative border-2 bg-black p-2 overflow-hidden transition-colors duration-300 clip-corner-tr
            ${
              selected
                ? "border-zzz-lime shadow-[0_0_20px_rgba(204,255,0,0.2)]"
                : "border-zzz-gray hover:border-white"
            }
            ${isUploading ? "border-zzz-orange border-dashed" : ""}
        `}
      >
        <div className="relative">
          <img
            src={src}
            alt={node.attrs.alt}
            className={`w-full h-auto object-cover max-h-[600px] transition-opacity duration-300 ${
              isUploading ? "opacity-50 blur-sm grayscale" : "opacity-100"
            }`}
          />

          {/* Uploading Overlay */}
          {isUploading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
              <div className="bg-black/80 backdrop-blur border border-zzz-orange p-4 rounded-sm flex flex-col items-center gap-2 shadow-xl">
                <Loader2 className="text-zzz-orange animate-spin" size={24} />
                <div className="text-[10px] font-mono font-bold text-zzz-orange uppercase tracking-widest flex items-center gap-2">
                  <UploadCloud size={12} /> Uploading Asset...
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Scanline overlay */}
        <div className="absolute inset-0 bg-stripe-pattern opacity-10 pointer-events-none"></div>
      </div>

      <div className="mt-2 flex items-center gap-2 font-mono text-xs text-gray-500">
        <div className="h-px bg-zzz-gray flex-1"></div>
        <span className="uppercase tracking-widest text-[10px] shrink-0">
          FIG.
        </span>
        <input
          type="text"
          value={node.attrs.alt || ""}
          onChange={(e) => updateAttributes({ alt: e.target.value })}
          placeholder={
            isUploading ? "Waiting for upload..." : "ENTER_IMAGE_DESCRIPTION..."
          }
          disabled={isUploading}
          className="bg-transparent border-b border-zzz-gray/30 text-zzz-lime text-xs font-mono uppercase focus:outline-none focus:border-zzz-lime w-48 md:w-64 placeholder-gray-700 text-right transition-colors disabled:opacity-50"
        />
      </div>
    </NodeViewWrapper>
  );
}
