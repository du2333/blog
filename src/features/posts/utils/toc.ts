import type { JSONContent } from "@tiptap/react";
import { slugify } from "@/features/posts/utils/content";

export interface TableOfContentsItem {
  id: string;
  text: string;
  level: number;
}

export function generateTableOfContents(
  content: JSONContent | undefined | null,
) {
  if (!content || !content.content) return [];

  const headings: Array<TableOfContentsItem> = [];

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
  if (node.text) return node.text;
  if (node.content) {
    return node.content.map(getNodeText).join("");
  }
  return "";
}
