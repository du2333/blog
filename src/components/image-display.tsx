import ZoomableImage from "./zoomable-image";

export function ImageDisplay({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="my-10 group relative">
      <div className="relative border-2 border-zzz-gray bg-black p-2 overflow-hidden hover:border-zzz-lime transition-colors duration-300 clip-corner-tr">
        <ZoomableImage
          src={src}
          alt={alt}
          className="w-full h-auto object-cover max-h-[600px] grayscale-20 group-hover:grayscale-0 transition-all duration-500"
          showHint={true}
        />

        {/* Scanline overlay */}
        <div className="absolute inset-0 bg-stripe-pattern opacity-10 pointer-events-none"></div>
      </div>
      {alt && (
        <div className="mt-2 flex items-center gap-2 font-mono text-xs text-gray-500">
          <div className="h-px bg-zzz-gray flex-1"></div>
          <span className="uppercase tracking-widest">FIG. {alt}</span>
        </div>
      )}
    </div>
  );
}
