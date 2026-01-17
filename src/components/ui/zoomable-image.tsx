import { ClientOnly } from "@tanstack/react-router";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ZoomableImageProps extends Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  "src"
> {
  className?: string;
  showHint?: boolean;
  src?: string;
}

const ZoomableImageInternal: React.FC<ZoomableImageProps> = ({
  className = "",
  alt = "",
  src,
  showHint = false,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
  };

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

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const originalSrc = React.useMemo(() => {
    if (!src) return undefined;

    try {
      const base =
        typeof window !== "undefined" ? window.location.origin : undefined;
      const url = base ? new URL(src, base) : new URL(src);
      url.searchParams.set("original", "true");
      return url.toString();
    } catch {
      return src.includes("?")
        ? `${src}&original=true`
        : `${src}?original=true`;
    }
  }, [src]);

  if (!src) return null;

  return (
    <>
      <div
        className="relative group cursor-zoom-in block w-full h-auto"
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

        {/* Hover Hint Overlay - Minimalist */}
        {showHint && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/2 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
            <div className="bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border/20 transform scale-95 group-hover:scale-100 transition-all duration-500">
              <span className="text-[10px] font-mono uppercase tracking-widest text-foreground/70">
                点击查看大图
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Portal */}
      {createPortal(
        <div
          className={`fixed inset-0 z-200 flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${
            isOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-background/98 backdrop-blur-xl"
            onClick={handleClose}
          />

          {/* Controls */}
          <div
            className={`absolute top-0 left-0 right-0 p-8 flex justify-between items-start z-210 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${
              isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
            }`}
          >
            <div className="flex flex-col gap-1">
              <span className="text-xs font-mono font-medium text-foreground tracking-widest uppercase">
                图片预览
              </span>
              <span className="text-[10px] font-mono text-muted-foreground tracking-wider opacity-60">
                {alt || "Untitled"}
              </span>
            </div>

            <div className="flex gap-6 items-center">
              <a
                href={originalSrc}
                download
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-2"
              >
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
                  下载
                </span>
              </a>
              <button
                onClick={handleClose}
                className="group flex items-center gap-2"
              >
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
                  关闭
                </span>
              </button>
            </div>
          </div>

          {/* Image */}
          <div
            className={`relative z-205 p-6 md:p-12 w-full h-full flex items-center justify-center transition-all duration-700 delay-100 ease-[cubic-bezier(0.23,1,0.32,1)] ${
              isOpen ? "scale-100 opacity-100" : "scale-[0.98] opacity-0"
            }`}
          >
            <img
              src={src}
              alt={alt}
              loading="eager"
              className="max-w-full max-h-full object-contain shadow-none"
            />
          </div>
        </div>,
        document.body,
      )}
    </>
  );
};

export default function ZoomableImage(props: ZoomableImageProps) {
  return (
    <ClientOnly>
      <ZoomableImageInternal {...props} />
    </ClientOnly>
  );
}
