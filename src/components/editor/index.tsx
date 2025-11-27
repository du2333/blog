import { SaveIndicator } from "@/components/editor/extensions/save-indicator";
import { BubbleMenu } from "@/components/editor/extensions/toolbar/bubble-menu";
import { useAutoSave } from "@/components/editor/hooks/use-auto-save";
import type { EditorProps } from "@/components/editor/types";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import CodeBlockShiki from "tiptap-extension-code-block-shiki";
import { HeadingExtension } from "@/components/editor/extensions/typography/heading";
import { BlockQuoteExtension } from "./extensions/typography/block-quote";
import {
  BulletListExtension,
  ListItemExtension,
  OrderedListExtension,
} from "./extensions/typography/list";

// import { ImageExtension } from "@/components/editor/extensions/images";
// import { uploadImageFn } from "@/functions/images";
// import { FileHandler } from "@/components/editor/extensions/file-handler";
// import { toast } from "sonner";
// import { handleImageDeletes } from "./utils";

export const extensions = [
  StarterKit.configure({
    orderedList: false,
    bulletList: false,
    listItem: false,
    heading: false,
    codeBlock: false,
    blockquote: false,
    code: {
      HTMLAttributes: {
        class:
          "bg-zzz-gray text-zzz-lime px-1.5 py-0.5 rounded-sm font-mono text-sm border border-zzz-gray/50",
        spellCheck: false,
      },
    },
    underline: {
      HTMLAttributes: {
        class: "text-white decoration-zzz-lime decoration-2 underline-offset-4",
      },
    },
    strike: {
      HTMLAttributes: {
        class:
          "text-gray-500 decoration-zzz-orange decoration-2 line-through opacity-70",
      },
    },
    link: {
      autolink: true,
      openOnClick: false,
      HTMLAttributes: {
        class: `
        text-zzz-cyan font-bold underline decoration-transparent 
        hover:underline hover:cursor-pointer hover:decoration-zzz-cyan underline-offset-4 transition-all
        
        /* 2. 为图标预留空间并设置对齐 */
        inline-flex items-center gap-0.5
        
        /* 3. 使用伪元素 ::after 渲染图标 */
        after:content-[''] 
        after:w-3 after:h-3 after:mb-0.5
        after:bg-current /* 让图标颜色跟随文字颜色 (zzz-cyan) */
        
        /* 4. 关键：使用 mask-image 加载 SVG */
        after:[mask-image:url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0xOCAxM3Y2YTIgMiAwIDAgMS0yIDJINWEyIDIgMCAwIDEtMi0yVjhhMiAyIDAgMCAxIDItMmg2Ii8+PHBvbHlsaW5lIHBvaW50cz0iMTUgMyAyMSAzIDIxIDkiLz48bGluZSB4MT0iMTAiIHkxPSIxNCIgeDI9IjIxIiB5Mj0iMyIvPjwvc3ZnPg==')]
        after:[mask-size:contain]
        after:[mask-repeat:no-repeat]
        after:[mask-position:center]
      `,
        target: "_blank",
      },
    },
  }),
  BulletListExtension,
  OrderedListExtension,
  ListItemExtension,
  HeadingExtension.configure({
    levels: [1, 2, 3, 4],
  }),
  BlockQuoteExtension,
  CodeBlockShiki.configure({
    defaultTheme: "andromeeda",
    HTMLAttributes: {
      class: "p-4",
      spellCheck: false,
    },
  }),
  // ImageExtension,
  // FileHandler.configure({
  //   allowedMimeTypes: ["image/*"],
  //   allowBase64: true,
  //   maxFileSize: 10 * 1024 * 1024,
  //   onDrop: (editor, files, pos) => {
  //     files.forEach(async (file) => {
  //       const formData = new FormData();
  //       formData.append("image", file);
  //       toast.promise(uploadImageFn({ data: formData }), {
  //         loading: "Uploading image...",
  //         success: (result) => {
  //           editor.commands.insertContentAt(pos, {
  //             type: "image",
  //             attrs: {
  //               src: result.url,
  //             },
  //           });
  //           return "Image uploaded successfully";
  //         },
  //         error: (error) =>
  //           error instanceof Error ? error.message : "Unknown error",
  //       });
  //     });
  //   },
  //   onPaste(editor, files) {
  //     files.forEach(async (file) => {
  //       try {
  //         const formData = new FormData();
  //         formData.append("image", file);
  //         toast.promise(uploadImageFn({ data: formData }), {
  //           loading: "Uploading image...",
  //           success: (result) => {
  //             editor.commands.insertContent({
  //               type: "image",
  //               attrs: {
  //                 src: result.url,
  //               },
  //             });
  //             return "Image uploaded successfully";
  //           },
  //           error: (error) =>
  //             error instanceof Error ? error.message : "Unknown error",
  //         });
  //       } catch (error) {
  //         toast.error("Failed to upload image", {
  //           description:
  //             error instanceof Error ? error.message : "Unknown error",
  //         });
  //       }
  //     });
  //   },
  //   onValidationError(errors) {
  //     console.error(errors);
  //   },
  // }),
];

export function Editor({ content, onSave, onSaveStatusChange }: EditorProps) {
  const { saveStatus, handleUpdate } = useAutoSave({
    onSave,
    onSaveStatusChange,
  });

  const editor = useEditor({
    extensions,
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      handleUpdate(editor);
      // handleImageDeletes(transaction);
    },
  });

  if (!editor) return null;

  return (
    <div className="relative w-full bg-zzz-black border border-zzz-gray clip-corner-tr pb-[60px] sm:pb-0 overflow-hidden group">
      {/* Decorative corner */}
      <div className="absolute top-0 right-0 w-4 h-4 bg-zzz-lime opacity-0 group-hover:opacity-100 transition-opacity"></div>

      <EditorContent
        editor={editor}
        className="min-h-[600px] w-full min-w-full cursor-text sm:p-8"
      />
      <BubbleMenu editor={editor} />
      <SaveIndicator status={saveStatus} />
    </div>
  );
}
