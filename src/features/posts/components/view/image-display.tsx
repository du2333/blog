import ZoomableImage from "@/components/ui/zoomable-image";

export function ImageDisplay({ src, alt }: { src: string; alt: string }) {
  return (
    <figure className="my-16 group relative block">
      {/* Image Container */}
      <div className="relative bg-muted overflow-hidden rounded-sm border border-border transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:shadow-2xl group-hover:shadow-foreground/5 group-hover:-translate-y-1.5">
        <ZoomableImage
          src={src}
          alt={alt}
          className="w-full h-auto object-cover max-h-[800px] transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] scale-100 group-hover:scale-[1.02] group-hover:brightness-[1.03]"
          showHint={true}
        />

        {/* Subtle glass overlay on hover */}
        <div className="absolute inset-0 bg-linear-to-t from-black/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      </div>

      {/* Caption Content */}
      {alt && (
        <figcaption className="mt-5 flex items-center gap-3 px-2">
          <div className="h-px w-6 bg-border transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:w-10 group-hover:bg-muted-foreground" />
          <span className="text-[10px] font-mono font-medium text-muted-foreground tracking-[0.3em] transition-colors duration-500 group-hover:text-foreground/80">
            {alt}
          </span>
        </figcaption>
      )}
    </figure>
  );
}
