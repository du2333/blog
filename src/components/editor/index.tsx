import { ImageExtension } from "@/components/editor/extensions/images";
import { SaveIndicator } from "@/components/editor/extensions/save-indicator";
import { BubbleMenu } from "@/components/editor/extensions/toolbar/bubble-menu";
import { useAutoSave } from "@/components/editor/hooks/use-auto-save";
import type { EditorProps } from "@/components/editor/types";
import { uploadImageFn } from "@/core/functions/images";
import { Highlight } from "@tiptap/extension-highlight";
import { TextAlign } from "@tiptap/extension-text-align";
import { Color, TextStyle } from "@tiptap/extension-text-style";
import { Typography } from "@tiptap/extension-typography";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import CodeBlockShiki from "tiptap-extension-code-block-shiki";
import "./style.css";

import { FileHandler } from "@/components/editor/extensions/file-handler";
import { toast } from "sonner";
import { handleImageDeletes } from "./utils";

export const extensions = [
  StarterKit.configure({
    orderedList: {
      HTMLAttributes: {
        class: "list-decimal",
      },
    },
    bulletList: {
      HTMLAttributes: {
        class: "list-disc",
      },
    },
    heading: {
      levels: [1, 2, 3, 4],
    },
    codeBlock: false,
  }),
  CodeBlockShiki.configure({
    defaultTheme: "tokyo-night",
    themes: {
      light: "github-light",
      dark: "github-dark",
    },
  }),
  Typography,
  TextAlign.configure({
    types: ["heading", "paragraph"],
  }),
  TextStyle,
  Color,
  Highlight.configure({
    multicolor: true,
  }),
  ImageExtension,
  FileHandler.configure({
    allowedMimeTypes: ["image/*"],
    allowBase64: true,
    maxFileSize: 10 * 1024 * 1024,
    onDrop: (editor, files, pos) => {
      files.forEach(async (file) => {
        const formData = new FormData();
        formData.append("image", file);
        toast.promise(uploadImageFn({ data: formData }), {
          loading: "Uploading image...",
          success: (result) => {
            editor.commands.insertContentAt(pos, {
              type: "image",
              attrs: {
                src: result.url,
              },
            });
            return "Image uploaded successfully";
          },
          error: (error) =>
            error instanceof Error ? error.message : "Unknown error",
        });
      });
    },
    onPaste(editor, files) {
      files.forEach(async (file) => {
        try {
          const formData = new FormData();
          formData.append("image", file);
          toast.promise(uploadImageFn({ data: formData }), {
            loading: "Uploading image...",
            success: (result) => {
              editor.commands.insertContent({
                type: "image",
                attrs: {
                  src: result.url,
                },
              });
              return "Image uploaded successfully";
            },
            error: (error) =>
              error instanceof Error ? error.message : "Unknown error",
          });
        } catch (error) {
          toast.error("Failed to upload image", {
            description:
              error instanceof Error ? error.message : "Unknown error",
          });
        }
      });
    },
    onValidationError(errors) {
      console.error(errors);
    },
  }),
];

export function Editor({ content, onSave, onSaveStatusChange }: EditorProps) {
  const { saveStatus, handleUpdate } = useAutoSave({
    onSave,
    onSaveStatusChange,
  });

  const editor = useEditor({
    extensions,
    editorProps: {
      attributes: {
        class: "max-w-full focus:outline-none",
      },
    },
    content,
    immediatelyRender: false,
    onUpdate: ({ editor, transaction }) => {
      handleUpdate(editor);
      handleImageDeletes(transaction);
    },
  });

  if (!editor) return null;

  return (
    <div className="relative w-full bg-card pb-[60px] sm:pb-0">
      <EditorContent
        editor={editor}
        className=" min-h-[600px] w-full min-w-full cursor-text sm:p-6"
      />
      <BubbleMenu editor={editor} />
      <SaveIndicator status={saveStatus} />
    </div>
  );
}
