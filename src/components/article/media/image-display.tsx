import ZoomableImage from "./zoomable-image";

export function ImageDisplay({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="my-16 group relative space-y-4">
      <div className="relative bg-muted/50 rounded-sm overflow-hidden transition-all duration-700 border border-border group-hover:border-border p-2">
        <ZoomableImage
          src={src}
          alt={alt}
          className="w-full h-auto object-cover max-h-[800px] transition-all duration-1000 scale-[1.02] group-hover:scale-100"
          showHint={true}
        />
      </div>
      {alt && (
        <div className="flex items-center gap-4 px-2">
          <span className="text-[10px] font-mono font-medium text-muted-foreground uppercase tracking-[0.4em]">
            {alt}
          </span>
          <div className="h-px bg-border flex-1"></div>
        </div>
      )}
    </div>
  );
}
