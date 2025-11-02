import { renderToHTMLString } from "@tiptap/static-renderer";
import type { JSONContent } from "@tiptap/react";
import { extensions } from "@/components/editor";

export function renderHtml(content: JSONContent) {
  return renderToHTMLString({
    extensions,
    content,
  });
}
