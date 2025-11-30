import { CodeBlockExtension } from "@/components/editor/extensions/code-block";
import { ImageExtension } from "@/components/editor/extensions/images";
import InsertModal, {
  ModalType,
} from "@/components/editor/extensions/toolbar/components/insert-modal";
import EditorToolbar from "@/components/editor/extensions/toolbar/editor-toolbar";
import { BlockQuoteExtension } from "@/components/editor/extensions/typography/block-quote";
import { HeadingExtension } from "@/components/editor/extensions/typography/heading";
import {
  BulletListExtension,
  ListItemExtension,
  OrderedListExtension,
} from "@/components/editor/extensions/typography/list";
import Placeholder from "@tiptap/extension-placeholder";
import type { JSONContent } from "@tiptap/react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useState, useCallback } from "react";

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
  CodeBlockExtension.configure({
    defaultTheme: "andromeeda",
  }),
  ImageExtension,
  Placeholder.configure({
    placeholder: "INITIATE LOG ENTRY... (Start typing)",
  }),
];

interface EditorProps {
  content?: JSONContent | string;
  onChange?: (json: JSONContent) => void;
}

export function Editor({ content, onChange }: EditorProps) {
  const [modalOpen, setModalOpen] = useState<ModalType>(null);
  const [modalInitialUrl, setModalInitialUrl] = useState("");

  const editor = useEditor({
    extensions,
    content,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getJSON());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none focus:outline-none text-lg text-gray-300 font-body leading-relaxed min-h-[500px]",
      },
    },
  });

  const openLinkModal = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    setModalInitialUrl(previousUrl || "");
    setModalOpen("LINK");
  }, [editor]);

  const openImageModal = useCallback(() => {
    setModalInitialUrl("");
    setModalOpen("IMAGE");
  }, []);

  const handleModalSubmit = (url: string) => {
    if (!editor) return;

    if (modalOpen === "LINK") {
      if (url === "") {
        editor.chain().focus().extendMarkRange("link").unsetLink().run();
      } else {
        editor
          .chain()
          .focus()
          .extendMarkRange("link")
          .setLink({ href: url })
          .run();
      }
    } else if (modalOpen === "IMAGE") {
      if (url) {
        editor.chain().focus().setImage({ src: url }).run();
      }
    }

    setModalOpen(null);
  };

  return (
    <div className="flex flex-col relative group">
      <EditorToolbar
        editor={editor}
        onLinkClick={openLinkModal}
        onImageClick={openImageModal}
      />

      <div className="relative min-h-[500px]">
        <EditorContent editor={editor} />
      </div>

      <InsertModal
        type={modalOpen}
        initialUrl={modalInitialUrl}
        onClose={() => setModalOpen(null)}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
}
