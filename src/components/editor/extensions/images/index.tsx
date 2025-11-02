import Image from "@tiptap/extension-image";
import {
  type NodeViewProps,
  NodeViewWrapper,
  ReactNodeViewRenderer,
} from "@tiptap/react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Edit,
  MoreVertical,
  Trash,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ImageZoom } from "@/components/image-zoom";

export const ImageExtension = Image.extend({
  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      width: {
        default: "100%",
      },
      height: {
        default: null,
      },
      align: {
        default: "center",
      },
      caption: {
        default: "",
      },
      aspectRatio: {
        default: null,
      },
    };
  },

  addNodeView: () => {
    return ReactNodeViewRenderer(TiptapImage);
  },

  renderHTML({
    HTMLAttributes,
    node,
  }: {
    HTMLAttributes: Record<string, any>;
    node: { attrs: Record<string, any> };
  }) {
    // 从 node.attrs 获取自定义属性，从 HTMLAttributes 获取标准 HTML 属性
    const caption = node.attrs.caption || HTMLAttributes.caption;
    const align = node.attrs.align || HTMLAttributes.align || "center";
    // 获取 width，如果为 null/undefined，使用 "100%"
    const rawWidth = node.attrs.width ?? HTMLAttributes.width;
    const width =
      rawWidth !== null && rawWidth !== undefined ? rawWidth : "100%";
    const { caption: _, align: __, width: ___, ...imgAttrs } = HTMLAttributes;

    // 处理 alt：如果没有 alt，使用 caption 作为 alt
    const alt = imgAttrs.alt || caption || "blog image";

    // 处理宽度：确保是字符串格式
    let widthStr = width;
    if (width === "100%") {
      // 默认值，保持不变
      widthStr = "100%";
    } else if (typeof width === "number") {
      widthStr = `${width}px`;
    } else if (typeof width === "string") {
      // 如果是不带单位的数字字符串，添加 px
      if (
        !width.includes("px") &&
        !width.includes("%") &&
        !isNaN(Number(width))
      ) {
        widthStr = `${width}px`;
      }
    }

    // 构建 figure 的属性对象（即使 width 是 "100%"，也明确设置）
    const figureAttrs: Record<string, any> = {
      "data-align": align,
      "data-width": widthStr,
    };

    // 构建 figure 的子元素数组
    // 添加图片优化属性：懒加载和异步解码
    const optimizedImgAttrs: Record<string, any> = {
      ...imgAttrs,
      alt,
      loading: "lazy",
      decoding: "async",
    };

    // width 属性：如果是百分比，使用 style；如果是像素值，可以设置 width 属性
    // 但为了灵活性，统一使用 style
    if (widthStr && widthStr !== "100%") {
      optimizedImgAttrs.style = {
        ...(imgAttrs.style || {}),
        width: widthStr,
      };
    }

    const children: any[] = [["img", optimizedImgAttrs]];

    // 如果有 caption，添加 figcaption
    if (caption) {
      children.push(["figcaption", {}, caption]);
    }

    // 返回 figure 结构，使用展开运算符展开子元素
    return ["figure", figureAttrs, ...children];
  },
});

function TiptapImage(props: NodeViewProps) {
  const { node, editor, selected, deleteNode, updateAttributes } = props;
  const imageRef = useRef<HTMLImageElement | null>(null);
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const [resizing, setResizing] = useState(false);
  const [resizingPosition, setResizingPosition] = useState<"left" | "right">(
    "left"
  );
  const [resizeInitialWidth, setResizeInitialWidth] = useState(0);
  const [resizeInitialMouseX, setResizeInitialMouseX] = useState(0);
  const [editingCaption, setEditingCaption] = useState(false);
  const [caption, setCaption] = useState(node.attrs.caption || "");
  const [openedMore, setOpenedMore] = useState(false);

  function handleResizingPosition({
    e,
    position,
  }: {
    e: React.MouseEvent<HTMLDivElement, MouseEvent>;
    position: "left" | "right";
  }) {
    startResize(e);
    setResizingPosition(position);
  }

  function startResize(event: React.MouseEvent<HTMLDivElement>) {
    event.preventDefault();
    setResizing(true);
    setResizeInitialMouseX(event.clientX);
    if (imageRef.current) {
      setResizeInitialWidth(imageRef.current.offsetWidth);
    }
  }

  function resize(event: MouseEvent) {
    if (!resizing) return;

    let dx = event.clientX - resizeInitialMouseX;
    if (resizingPosition === "left") {
      dx = resizeInitialMouseX - event.clientX;
    }

    const newWidth = Math.max(resizeInitialWidth + dx, 150);
    const parentWidth = nodeRef.current?.parentElement?.offsetWidth ?? 0;

    if (newWidth < parentWidth) {
      updateAttributes({
        width: newWidth,
      });
    }
  }

  function endResize() {
    setResizing(false);
    setResizeInitialMouseX(0);
    setResizeInitialWidth(0);
  }

  function handleTouchStart(
    event: React.TouchEvent,
    position: "left" | "right"
  ) {
    event.preventDefault();
    setResizing(true);
    setResizingPosition(position);
    setResizeInitialMouseX(event.touches[0]?.clientX ?? 0);
    if (imageRef.current) {
      setResizeInitialWidth(imageRef.current.offsetWidth);
    }
  }

  function handleTouchMove(event: TouchEvent) {
    if (!resizing) return;

    let dx =
      (event.touches[0]?.clientX ?? resizeInitialMouseX) - resizeInitialMouseX;
    if (resizingPosition === "left") {
      dx =
        resizeInitialMouseX -
        (event.touches[0]?.clientX ?? resizeInitialMouseX);
    }

    const newWidth = Math.max(resizeInitialWidth + dx, 150);
    const parentWidth = nodeRef.current?.parentElement?.offsetWidth ?? 0;

    if (newWidth < parentWidth) {
      updateAttributes({
        width: newWidth,
      });
    }
  }

  function handleTouchEnd() {
    setResizing(false);
    setResizeInitialMouseX(0);
    setResizeInitialWidth(0);
  }

  function handleCaptionChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newCaption = e.target.value;
    setCaption(newCaption);
  }

  function handleCaptionBlur() {
    updateAttributes({ caption });
    setEditingCaption(false);
  }

  function handleCaptionKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      handleCaptionBlur();
    }
  }

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", endResize);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", endResize);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [resizing, resizeInitialMouseX, resizeInitialWidth]);

  return (
    <NodeViewWrapper
      ref={nodeRef}
      className={cn(
        "relative flex flex-col rounded-md border-2 border-transparent transition-all duration-200",
        selected ? "border-blue-300" : "",
        node.attrs.align === "left" && "left-0 translate-x-0",
        node.attrs.align === "center" && "left-1/2 -translate-x-1/2",
        node.attrs.align === "right" && "left-full -translate-x-full"
      )}
      style={{ width: node.attrs.width }}
    >
      <div
        className={cn(
          "group relative flex flex-col rounded-md",
          resizing && ""
        )}
      >
        <ImageZoom className="relative m-0">
          <img
            ref={imageRef}
            src={node.attrs.src}
            alt={node.attrs.alt}
            title={node.attrs.title}
            className="rounded-lg transition-shadow duration-200 hover:shadow-lg"
            onLoad={(e) => {
              const img = e.currentTarget;
              const aspectRatio = img.naturalWidth / img.naturalHeight;
              updateAttributes({ aspectRatio });
            }}
          />
          {editor?.isEditable && (
            <>
              <div
                className="absolute inset-y-0 z-20 flex w-[25px] cursor-col-resize items-center justify-start p-2"
                style={{ left: 0 }}
                onMouseDown={(event) => {
                  handleResizingPosition({ e: event, position: "left" });
                }}
                onTouchStart={(event) => handleTouchStart(event, "left")}
              >
                <div className="z-20 h-[70px] w-1 rounded-xl border bg-[rgba(0,0,0,0.65)] opacity-0 transition-all group-hover:opacity-100" />
              </div>
              <div
                className="absolute inset-y-0 z-20 flex w-[25px] cursor-col-resize items-center justify-end p-2"
                style={{ right: 0 }}
                onMouseDown={(event) => {
                  handleResizingPosition({ e: event, position: "right" });
                }}
                onTouchStart={(event) => handleTouchStart(event, "right")}
              >
                <div className="z-20 h-[70px] w-1 rounded-xl border bg-[rgba(0,0,0,0.65)] opacity-0 transition-all group-hover:opacity-100" />
              </div>
            </>
          )}
        </ImageZoom>

        {editingCaption ? (
          <Input
            value={caption}
            onChange={handleCaptionChange}
            onBlur={handleCaptionBlur}
            onKeyDown={handleCaptionKeyDown}
            className="mt-2 text-center text-sm text-muted-foreground focus:ring-0"
            placeholder="Add a caption..."
            autoFocus
          />
        ) : (
          <div
            className="mt-2 cursor-text text-center text-sm text-muted-foreground"
            onClick={() => editor?.isEditable && setEditingCaption(true)}
          >
            {caption || "Add a caption..."}
          </div>
        )}

        {editor?.isEditable && (
          <div
            className={cn(
              "absolute right-4 top-4 flex items-center gap-1 rounded-md border bg-background/80 p-1 opacity-0 backdrop-blur transition-opacity",
              !resizing && "group-hover:opacity-100",
              openedMore && "opacity-100"
            )}
          >
            <Button
              size="icon"
              className={cn(
                "size-7",
                node.attrs.align === "left" && "bg-accent"
              )}
              variant="ghost"
              onClick={() => updateAttributes({ align: "left" })}
            >
              <AlignLeft className="size-4" />
            </Button>
            <Button
              size="icon"
              className={cn(
                "size-7",
                node.attrs.align === "center" && "bg-accent"
              )}
              variant="ghost"
              onClick={() => updateAttributes({ align: "center" })}
            >
              <AlignCenter className="size-4" />
            </Button>
            <Button
              size="icon"
              className={cn(
                "size-7",
                node.attrs.align === "right" && "bg-accent"
              )}
              variant="ghost"
              onClick={() => updateAttributes({ align: "right" })}
            >
              <AlignRight className="size-4" />
            </Button>
            <Separator orientation="vertical" className="h-5" />
            <DropdownMenu open={openedMore} onOpenChange={setOpenedMore}>
              <DropdownMenuTrigger asChild>
                <Button size="icon" className="size-7" variant="ghost">
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                alignOffset={-90}
                className="mt-1 text-sm"
              >
                <DropdownMenuItem onClick={() => setEditingCaption(true)}>
                  <Edit className="mr-2 size-4" /> Edit Caption
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={deleteNode}
                >
                  <Trash className="mr-2 size-4" /> Delete Image
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}
