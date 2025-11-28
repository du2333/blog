import type { JSONContent } from "@tiptap/react";
import { slugify } from "@/lib/editor-utils";

export interface TableOfContentsItem {
  id: string;
  text: string;
  level: number;
}

export function generateTableOfContents(
  content: JSONContent | undefined | null
) {
  if (!content || !content.content) return [];

  const headings: TableOfContentsItem[] = [];

  content.content.forEach((node) => {
    if (node.type === "heading") {
      const level = node.attrs?.level || 1;
      const text = getNodeText(node);
      const id = slugify(text);

      if (text) {
        headings.push({ id, text, level });
      }
    }
  });

  return headings;
}

function getNodeText(node: JSONContent): string {
  let text = "";
  if (node.content) {
    node.content.forEach((child) => {
      if (child.type === "text") {
        text += child.text || "";
      }
    });
  }
  return text;
}
