import { ImageZoom } from "@/components/image-zoom";
import { cn } from "@/lib/utils";

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
 * 图片显示组件，只提供放大功能，不包含编辑功能
 * 用于渲染后的 HTML 内容中
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
  // 处理宽度样式
  const widthStyle = width || "100%";

  // 根据对齐方式构建容器样式类
  const containerAlignClasses = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  };

  return (
    <div className={cn("flex w-full my-4", containerAlignClasses[align])}>
      <figure
        className={cn("flex flex-col rounded-md", className)}
        style={{ width: widthStyle }}
      >
        <ImageZoom className="relative m-0">
          <img
            src={src}
            alt={alt || caption || "blog image"}
            title={title}
            height={height}
            className="rounded-lg transition-shadow duration-200 hover:shadow-lg w-full"
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
