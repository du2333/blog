import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { ImageExtension } from "@/features/posts/editor/extensions/images";

export const commentExtensions = [
  StarterKit.configure({
    orderedList: false,
    bulletList: false,
    listItem: false,
    heading: false,
    codeBlock: false,
    blockquote: false,
    code: {
      HTMLAttributes: {
        class: "bg-muted px-1.5 py-0.5 rounded font-mono text-sm",
        spellCheck: false,
      },
    },
    underline: {
      HTMLAttributes: {
        class: "decoration-muted-foreground underline-offset-4",
      },
    },
    strike: {
      HTMLAttributes: {
        class: "text-muted-foreground line-through opacity-60",
      },
    },
    link: {
      autolink: true,
      openOnClick: false,
      HTMLAttributes: {
        class:
          "font-medium underline underline-offset-4 decoration-border hover:decoration-current transition-all duration-300 cursor-pointer",
        target: "_blank",
      },
    },
  }),
  ImageExtension.configure({
    inline: true,
    HTMLAttributes: {
      class: "rounded-md max-h-[300px] object-contain my-2", // 限制评论图片大小
    },
  }),
  Placeholder.configure({
    placeholder: "友善的评论是交流的起点...",
    emptyEditorClass: "is-editor-empty",
  }),
];
