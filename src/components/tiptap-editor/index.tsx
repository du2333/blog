import FileHandler from "@tiptap/extension-file-handler";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { ModalType } from "@/components/tiptap-editor/extensions/toolbar/components/insert-modal";
import type { JSONContent, Editor as TiptapEditor } from "@tiptap/react";
import { CodeBlockExtension } from "@/components/tiptap-editor/extensions/code-block";
import { ImageExtension } from "@/components/tiptap-editor/extensions/images";
import InsertModal from "@/components/tiptap-editor/extensions/toolbar/components/insert-modal";
import EditorToolbar from "@/components/tiptap-editor/extensions/toolbar/editor-toolbar";
import { BlockQuoteExtension } from "@/components/tiptap-editor/extensions/typography/block-quote";
import { HeadingExtension } from "@/components/tiptap-editor/extensions/typography/heading";
import {
  BulletListExtension,
  ListItemExtension,
  OrderedListExtension,
} from "@/components/tiptap-editor/extensions/typography/list";
import { ImageUpload } from "@/components/tiptap-editor/extensions/upload-image";
import { uploadImageFn } from "@/features/media/images.api";

const ALLOWED_IMAGE_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "image/webp",
];

async function handleImageUpload(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);
  const result = await uploadImageFn({ data: formData });
  toast.success("图片上传成功", {
    description: `${file.name} 已归档保存`,
  });
  return result.url;
}

function handleFileDrop(editor: TiptapEditor, files: Array<File>, pos: number) {
  files.forEach((file) => {
    if (ALLOWED_IMAGE_MIME_TYPES.includes(file.type)) {
      editor.commands.uploadImage(file, pos);
    }
  });
}

function handleFilePaste(editor: TiptapEditor, files: Array<File>) {
  files.forEach((file) => {
    if (ALLOWED_IMAGE_MIME_TYPES.includes(file.type)) {
      editor.commands.uploadImage(file);
    }
  });
}

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
  BulletListExtension,
  OrderedListExtension,
  ListItemExtension,
  HeadingExtension.configure({
    levels: [1, 2, 3, 4],
  }),
  BlockQuoteExtension,
  CodeBlockExtension.configure({
    defaultTheme: "vitesse-dark",
  }),
  ImageExtension,
  ImageUpload.configure({
    onUpload: handleImageUpload,
    onError: (error) => {
      toast.error("图片上传失败", {
        description: error.message,
      });
    },
  }),
  FileHandler.configure({
    allowedMimeTypes: ALLOWED_IMAGE_MIME_TYPES,
    onDrop: handleFileDrop,
    onPaste: handleFilePaste,
  }),
  Placeholder.configure({
    placeholder: "开始记录...",
    emptyEditorClass: "is-editor-empty",
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
          "prose prose-zinc dark:prose-invert max-w-none focus:outline-none text-lg font-body leading-relaxed min-h-[500px]",
      },
    },
  });

  const openLinkModal = useCallback(() => {
    const previousUrl = editor.getAttributes("link").href;
    setModalInitialUrl(previousUrl || "");
    setModalOpen("LINK");
  }, [editor]);

  const openImageModal = useCallback(() => {
    setModalInitialUrl("");
    setModalOpen("IMAGE");
  }, []);

  const handleModalSubmit = (url: string) => {
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
