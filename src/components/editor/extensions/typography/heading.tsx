import Heading from "@tiptap/extension-heading";
import { mergeAttributes } from "@tiptap/react";

export const HeadingExtension = Heading.extend({
  renderHTML({ HTMLAttributes, node }) {
    const level = node.attrs.level as 1 | 2 | 3 | 4;
    const textContent = node.textContent;
    const id = textContent.toLowerCase().replace(/\s+/g, "-");

    const styles: Record<number, string> = {
      1: "text-4xl md:text-5xl font-black text-white uppercase mb-8 mt-12 font-sans tracking-tight border-l-8 border-zzz-lime pl-4",
      2: "text-3xl md:text-4xl font-bold text-zzz-white uppercase mb-6 mt-12 font-sans border-b-2 border-zzz-gray pb-2 flex items-center gap-2",
      3: "text-2xl font-bold text-zzz-lime uppercase mb-4 mt-8 font-sans tracking-wide",
      4: "text-xl font-bold text-zzz-cyan uppercase mb-3 mt-6 font-mono",
    };

    if (level === 2) {
      return [
        "h2",
        mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
          class: styles[level],
          id,
        }),
        [
          "span",
          {
            class: "text-zzz-lime text-xl mr-2 select-none",
            contenteditable: "false",
          },
          "##",
        ],
        ["span", {}, 0],
      ];
    }

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
