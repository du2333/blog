import { renderToHTMLString } from "@tiptap/static-renderer";
import type { JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export function renderHtml(content: JSONContent) {
  return renderToHTMLString({
    extensions: [StarterKit],
    content,
  });
}
