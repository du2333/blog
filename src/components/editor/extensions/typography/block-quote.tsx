import { Blockquote } from "@tiptap/extension-blockquote";
import { mergeAttributes } from "@tiptap/react";

export const BlockQuoteExtension = Blockquote.extend({
  renderHTML({ HTMLAttributes }) {
    return [
      "blockquote",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class:
          "my-8 relative pl-8 border-l-4 border-zzz-lime bg-linear-to-r from-zzz-dark to-transparent py-4 pr-4",
      }),

      [
        "div",
        {
          class:
            "absolute -left-[11px] -top-2 w-6 h-6 bg-zzz-black border-2 border-zzz-lime rounded-full flex items-center justify-center",
        },
        [
          "span",
          {
            class: "text-zzz-lime text-lg font-serif font-bold leading-none",
          },
          '"',
        ],
      ],

      [
        "div",
        {
          class:
            "italic text-gray-300 font-serif text-lg md:text-xl leading-relaxed",
        },
        0,
      ],
    ];
  },
});
