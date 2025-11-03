import { extensions } from "@/components/editor";
import { ImageDisplay } from "@/components/image-display";
import type { JSONContent } from "@tiptap/react";
import { renderToReactElement } from "@tiptap/static-renderer/pm/react";

export function renderReact(content: JSONContent) {
  return renderToReactElement({
    extensions,
    content,
    options: {
      nodeMapping: {
        image: ({ node }) => {
          const attrs = node.attrs as {
            src: string;
            alt?: string | null;
            title?: string | null;
            width?: string | number | null;
            height?: string | number | null;
            align?: "left" | "center" | "right" | null;
            caption?: string | null;
          };

          // 处理 width：确保是字符串格式
          let widthStr: string | undefined = undefined;
          if (attrs.width !== null && attrs.width !== undefined) {
            if (typeof attrs.width === "number") {
              widthStr = `${attrs.width}px`;
            } else if (typeof attrs.width === "string") {
              if (attrs.width === "100%") {
                widthStr = "100%";
              } else if (
                !attrs.width.includes("px") &&
                !attrs.width.includes("%") &&
                !isNaN(Number(attrs.width))
              ) {
                widthStr = `${attrs.width}px`;
              } else {
                widthStr = attrs.width;
              }
            }
          }

          // 处理 alt：如果没有 alt，使用 caption 作为 alt
          const alt =
            (attrs.alt && attrs.alt !== "null" ? attrs.alt : null) ||
            (attrs.caption && attrs.caption !== "null"
              ? attrs.caption
              : null) ||
            "blog image";

          // 处理其他属性
          const title =
            attrs.title && attrs.title !== "null" ? attrs.title : undefined;
          const height =
            attrs.height && attrs.height !== "null" ? attrs.height : undefined;
          const caption =
            attrs.caption && attrs.caption !== "null"
              ? attrs.caption
              : undefined;
          // 处理 align：如果是 null 或无效值，使用 "center"
          const align: "left" | "center" | "right" =
            attrs.align === "left" || attrs.align === "right"
              ? attrs.align
              : "center";

          return (
            <ImageDisplay
              src={attrs.src}
              alt={alt}
              title={title}
              width={widthStr}
              height={height ? height.toString() : undefined}
              align={align}
              caption={caption}
            />
          );
        },
      },
    },
  });
}
