import { toast } from "sonner";
import FileHandler from "@tiptap/extension-file-handler";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import TableOfContents from "@tiptap/extension-table-of-contents";
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
import { slugify } from "@/features/posts/utils/content";

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
        class:
          "font-mono text-sm px-1 text-foreground/80 bg-muted/40 rounded-sm",
        spellCheck: false,
      },
    },
    underline: {
      HTMLAttributes: {
        class: "underline underline-offset-4 decoration-border/60",
      },
    },
    strike: {
      HTMLAttributes: {
        class: "line-through opacity-50 decoration-foreground/40",
      },
    },
    link: {
      autolink: true,
      openOnClick: false,
      HTMLAttributes: {
        class:
          "font-normal underline underline-offset-4 decoration-border hover:decoration-foreground transition-all duration-300 cursor-pointer text-foreground",
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
  TableOfContents.configure({
    getId: (text) => slugify(text),
  }),
];
