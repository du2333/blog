import { useEffect, useRef, useState } from "react";
import { ImageDisplay } from "@/components/image-display";
import type { HTMLReactParserOptions } from "html-react-parser";

interface HtmlContentProps {
  html: string;
  className?: string;
}

/**
 * 客户端组件：解析 HTML 并将图片转换为带有 ImageDisplay 的 React 组件
 * 在服务器端先渲染原始 HTML，然后在客户端 hydration 后替换为交互式组件
 */
export function HtmlContent({ html, className }: HtmlContentProps) {
  const [isClient, setIsClient] = useState(false);
  const [parsedContent, setParsedContent] = useState<React.ReactNode>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 只在客户端动态导入和解析
    if (typeof window === "undefined") return;

    setIsClient(true);

    // 动态导入 html-react-parser
    import("html-react-parser").then(({ default: parse, Element }) => {
      const options: HTMLReactParserOptions = {
        replace: (domNode) => {
          // 处理 <figure> 标签（包含图片和 caption）
          if (domNode instanceof Element && domNode.name === "figure") {
            const align = (domNode.attribs?.["data-align"] || "center") as
              | "left"
              | "center"
              | "right";
            const width = domNode.attribs?.["data-width"];

            // 查找内部的 img 和 figcaption
            let imgAttrs: Record<string, any> = {};
            let caption = "";

            if (domNode.children) {
              domNode.children.forEach((child) => {
                if (child instanceof Element) {
                  if (child.name === "img") {
                    imgAttrs = child.attribs || {};
                  } else if (child.name === "figcaption") {
                    // 提取 figcaption 中的文本内容
                    if (child.children && child.children.length > 0) {
                      const firstChild = child.children[0];
                      if (
                        firstChild &&
                        "data" in firstChild &&
                        typeof firstChild.data === "string"
                      ) {
                        caption = firstChild.data;
                      }
                    }
                  }
                }
              });
            }

            const { src, alt, title, height } = imgAttrs;
            // 优先使用 figure 上的 data-width，其次使用 img 上的 width
            let imageWidth = width || imgAttrs.width;

            // 处理宽度值
            if (!imageWidth || imageWidth === "null" || imageWidth === null) {
              imageWidth = undefined; // 使用默认值 100%
            } else if (typeof imageWidth === "number") {
              imageWidth = `${imageWidth}px`;
            } else if (typeof imageWidth === "string") {
              // 如果是 "null" 字符串，忽略
              if (imageWidth === "null") {
                imageWidth = undefined;
              } else if (
                !imageWidth.includes("%") &&
                !imageWidth.includes("px")
              ) {
                // 如果是不带单位的数字字符串，添加 px
                if (!isNaN(Number(imageWidth))) {
                  imageWidth = `${imageWidth}px`;
                }
              }
            }

            // 过滤掉 "null" 字符串
            const imageTitle = title && title !== "null" ? title : undefined;
            const imageHeight =
              height && height !== "null" ? height : undefined;
            const imageCaption =
              caption && caption !== "null" ? caption : undefined;
            const imageAlt = alt || imageCaption || "blog image";

            if (src) {
              return (
                <ImageDisplay
                  src={src}
                  alt={imageAlt}
                  title={imageTitle}
                  width={imageWidth}
                  height={imageHeight}
                  align={align}
                  caption={imageCaption}
                />
              );
            }
          }

          // 处理单独的 <img> 标签（向后兼容）
          if (domNode instanceof Element && domNode.name === "img") {
            const { src, alt, title, width, height, align, caption } =
              domNode.attribs || {};

            // 过滤掉 "null" 字符串
            const imageTitle = title && title !== "null" ? title : undefined;
            const imageHeight =
              height && height !== "null" ? height : undefined;
            const imageCaption =
              caption && caption !== "null" ? caption : undefined;
            const imageAlt = alt || imageCaption || "blog image";
            const imageAlign = (
              align && align !== "null" ? align : "center"
            ) as "left" | "center" | "right";

            if (src) {
              return (
                <ImageDisplay
                  src={src}
                  alt={imageAlt}
                  title={imageTitle}
                  width={width}
                  height={imageHeight}
                  align={imageAlign}
                  caption={imageCaption}
                />
              );
            }
          }
        },
      };

      setParsedContent(parse(html, options));
    });
  }, [html]);

  // 服务器端或未解析完成：直接渲染 HTML
  if (!isClient || !parsedContent) {
    return (
      <div
        ref={containerRef}
        className={className}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  // 客户端：渲染解析后的内容
  return (
    <div ref={containerRef} className={className}>
      {parsedContent}
    </div>
  );
}
