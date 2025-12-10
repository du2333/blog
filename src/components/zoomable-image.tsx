import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, ZoomIn, Download } from "lucide-react";
import { useDelayUnmount } from "@/hooks/use-delay-unmount";

interface ZoomableImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
  className?: string;
  showHint?: boolean;
  src?: string;
}

const ZoomableImage: React.FC<ZoomableImageProps> = ({
  className = "",
  alt = "",
  src,
  showHint = false,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const shouldRender = useDelayUnmount(isOpen, 200);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!src) return null;

  return (
    <>
      <div
        className={`relative group cursor-zoom-in block w-full h-auto`}
        onClick={() => setIsOpen(true)}
      >
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          className={`${className} block`}
          {...props}
        />

        {/* Hover Hint Overlay */}
        {showHint && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
            <div className="bg-black/80 backdrop-blur-sm p-3 rounded-full border border-zzz-lime shadow-[0_0_15px_rgba(204,255,0,0.3)] transform scale-90 group-hover:scale-100 transition-transform">
              <ZoomIn className="text-zzz-lime" size={24} />
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Portal */}
      {shouldRender &&
        createPortal(
          <div
            className={`fixed inset-0 z-200 flex items-center justify-center ${
              isOpen ? "pointer-events-auto" : "pointer-events-none"
            }`}
          >
            {/* Backdrop */}
            <div
              className={`absolute inset-0 bg-black/95 backdrop-blur-md transition-opacity duration-300 ${
                isOpen ? "opacity-100" : "opacity-0"
              }`}
              onClick={() => setIsOpen(false)}
            />

            {/* Controls */}
            <div
              className={`absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-210 transition-all duration-300 ${
                isOpen
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 -translate-y-4"
              }`}
            >
              <div className="flex flex-col">
                <span className="text-zzz-lime font-mono text-xs font-bold uppercase tracking-widest bg-black/50 px-2 py-1 border border-zzz-lime/30 rounded-sm">
                  IMG_VIEWER // {alt || "UNTITLED"}
                </span>
              </div>
              <div className="flex gap-4">
                <a
                  href={`${src}?original=true`}
                  download
                  target="_blank"
                  rel="noreferrer"
                >
                  <button className="p-2 text-gray-400 hover:text-zzz-cyan transition-colors bg-black/50 rounded-full border border-transparent hover:border-zzz-cyan/50">
                    <Download size={20} />
                  </button>
                </a>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-gray-400 hover:text-white transition-colors bg-black/50 rounded-full border border-transparent hover:border-white"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Image */}
            <div
              className={`relative z-205 p-4 md:p-10 w-full h-full flex items-center justify-center transition-all duration-300 ${
                isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
              }`}
            >
              <img
                src={src}
                alt={alt}
                loading="eager"
                className="max-w-full max-h-full object-contain shadow-2xl drop-shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-zzz-gray/20 bg-black"
              />
            </div>

            {/* Footer Decoration */}
            <div
              className={`absolute bottom-8 left-0 right-0 text-center pointer-events-none transition-opacity duration-500 delay-100 ${
                isOpen ? "opacity-100" : "opacity-0"
              }`}
            >
              <span className="text-[10px] font-mono text-zzz-gray uppercase tracking-[0.5em]">
                Click outside to close
              </span>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default ZoomableImage;
