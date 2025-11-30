import type { NodeViewProps } from "@tiptap/react";
import { NodeViewWrapper } from "@tiptap/react";

export function ImageBlock({
  node,
  updateAttributes,
  selected,
}: NodeViewProps) {
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
        `}
      >
        <img
          src={node.attrs.src}
          alt={node.attrs.alt}
          className="w-full h-auto object-cover max-h-[600px]"
        />

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
          placeholder="ENTER_IMAGE_DESCRIPTION..."
          className="bg-transparent border-b border-zzz-gray/30 text-zzz-lime text-xs font-mono uppercase focus:outline-none focus:border-zzz-lime w-48 md:w-64 placeholder-gray-700 text-right transition-colors"
        />
      </div>
    </NodeViewWrapper>
  );
}
