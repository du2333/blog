import { ImageZoom } from "@/components/image-zoom";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface ImageDisplayProps {
  src: string;
  alt?: string;
  title?: string;
  width?: string;
  height?: string;
  align?: "left" | "center" | "right";
  caption?: string;
  className?: string;
}

/**
 * 构建原图 URL（用于放大时查看）
 * 如果 URL 有 transformation 参数，移除它们并添加 original=true
 */
function getOriginalImageUrl(src: string): string {
  try {
    const url = new URL(src, window.location.origin);
    // 移除所有查询参数，添加 original=true
    url.search = "original=true";
    return url.pathname + url.search;
  } catch {
    // 如果不是完整 URL，尝试处理相对路径
    if (src.includes("?")) {
      const [path] = src.split("?");
      return `${path}?original=true`;
    }
    return `${src}?original=true`;
  }
}

/**
 * 图片显示组件，只提供放大功能，不包含编辑功能
 * 用于渲染后的 HTML 内容中
 * 默认显示优化后的图片，放大时自动切换到原图
 */
export function ImageDisplay({
  src,
  alt,
  title,
  width,
  height,
  align = "center",
  caption,
  className,
}: ImageDisplayProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) {
    return null;
  }

  // 处理宽度样式
  const widthStyle = width || "100%";

  // 根据对齐方式构建容器样式类
  const containerAlignClasses = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  };

  // 构建原图 URL（用于放大时查看）
  const originalImageUrl = getOriginalImageUrl(src);

  return (
    <div className={cn("flex w-full my-4", containerAlignClasses[align])}>
      <figure
        className={cn("flex flex-col rounded-md", className)}
        style={{ width: widthStyle }}
      >
        <ImageZoom className="relative m-0" zoomImg={{ src: originalImageUrl }}>
          <img
            src={src}
            alt={alt || caption || "blog image"}
            title={title}
            height={height}
            loading="lazy"
            decoding="async"
            className="rounded-lg transition-shadow duration-200 hover:shadow-lg w-full"
            style={{ width: widthStyle }}
          />
        </ImageZoom>
        {caption && (
          <figcaption className="mt-2 text-center text-sm text-muted-foreground">
            {caption}
          </figcaption>
        )}
      </figure>
    </div>
  );
}
