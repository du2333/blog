import Image from "@tiptap/extension-image";
import { ReactNodeViewRenderer } from "@tiptap/react";

import { ImageBlock } from "./block";

export const ImageExtension = Image.extend({
  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      width: {
        default: "100%",
      },
      height: {
        default: null,
      },
      align: {
        default: "center",
      },
      caption: {
        default: "",
      },
      aspectRatio: {
        default: null,
      },
    };
  },

  addNodeView: () => {
    return ReactNodeViewRenderer(ImageBlock);
  },
});
