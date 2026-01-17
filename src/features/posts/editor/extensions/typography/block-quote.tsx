import { Blockquote } from "@tiptap/extension-blockquote";
import { mergeAttributes } from "@tiptap/react";

export const BlockQuoteExtension = Blockquote.extend({
  renderHTML({ HTMLAttributes }) {
    return [
      "blockquote",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class:
          "my-12 pl-8 border-l-[3px] border-foreground py-4 italic text-muted-foreground font-serif text-xl md:text-3xl leading-relaxed tracking-tight",
      }),
      // Content renders here (0 = content placeholder, must be only child)
      0,
    ];
  },
});
