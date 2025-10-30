import { Typography } from "@tiptap/extension-typography";
import type { JSONContent, UseEditorOptions } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export function createEditorExtensions() {
  return [
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
    }),
    Typography,
  ];
}

export function createEditorConfig(
  content?: JSONContent | string
): Partial<UseEditorOptions> {
  return {
    extensions: createEditorExtensions(),
    editorProps: {
      attributes: {
        class: "max-w-full focus:outline-none",
      },
    },
    content,
    immediatelyRender: false,
  };
}

