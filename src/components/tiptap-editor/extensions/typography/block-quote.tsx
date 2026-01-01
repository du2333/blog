import { Blockquote } from "@tiptap/extension-blockquote";
import { mergeAttributes } from "@tiptap/react";

export const BlockQuoteExtension = Blockquote.extend({
  renderHTML({ HTMLAttributes }) {
    return [
      "blockquote",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: "my-12 relative pl-10 border-l border-border py-4",
      }),

      [
        "div",
        {
          class:
            "italic text-muted-foreground font-serif text-xl md:text-3xl leading-relaxed tracking-tight",
        },
        0,
      ],

      [
        "div",
        {
          class: "absolute -left-[1.5px] top-4 w-[3px] h-12 bg-foreground",
        },
      ],
    ];
  },
});
