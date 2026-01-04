import Heading from "@tiptap/extension-heading";
import { mergeAttributes } from "@tiptap/react";
import { slugify } from "@/features/posts/utils/content";

export const HeadingExtension = Heading.extend({
  renderHTML({ HTMLAttributes, node }) {
    const level = node.attrs.level as 1 | 2 | 3 | 4;
    const textContent = node.textContent;
    const id = slugify(textContent);

    const styles: Record<number, string> = {
      1: "text-4xl md:text-6xl font-serif font-medium mb-10 mt-16 leading-[1.1] tracking-tight",
      2: "text-3xl md:text-5xl font-serif font-medium mb-8 mt-14 leading-[1.1] tracking-tight",
      3: "text-2xl md:text-3xl font-serif font-medium mb-6 mt-12",
      4: "text-xl font-sans font-bold mb-4 mt-8 uppercase tracking-widest",
    };

    return [
      `h${level}`,
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: styles[level],
        id,
      }),
      0,
    ];
  },
});
