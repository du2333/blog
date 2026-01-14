import { toast } from "sonner";
import FileHandler from "@tiptap/extension-file-handler";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import type { Editor as TiptapEditor } from "@tiptap/react";
import { CodeBlockExtension } from "@/features/posts/editor/extensions/code-block";
import { ImageExtension } from "@/features/posts/editor/extensions/images";
import { BlockQuoteExtension } from "@/features/posts/editor/extensions/typography/block-quote";
import { HeadingExtension } from "@/features/posts/editor/extensions/typography/heading";
import {
  BulletListExtension,
  ListItemExtension,
  OrderedListExtension,
} from "@/features/posts/editor/extensions/typography/list";
import { ImageUpload } from "@/features/posts/editor/extensions/upload-image";
import { uploadImageFn } from "@/features/media/media.api";

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
  CodeBlockExtension,
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
