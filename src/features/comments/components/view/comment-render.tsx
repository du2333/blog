import { renderToReactElement } from "@tiptap/static-renderer/pm/react";
import type { JSONContent } from "@tiptap/react";
import { ImageDisplay } from "@/features/posts/components/view/image-display";
import { commentExtensions } from "@/features/comments/components/editor/config";

export function renderCommentReact(content: JSONContent | null) {
  if (!content) return null;
  return renderToReactElement({
    extensions: commentExtensions,
    content,
    options: {
      nodeMapping: {
        image: ({ node }) => {
          const attrs = node.attrs as {
            src: string;
            alt?: string | null;
          };

          const alt =
            (attrs.alt && attrs.alt !== "null" ? attrs.alt : null) ||
            "comment image";

          return <ImageDisplay src={attrs.src} alt={alt} />;
        },
      },
    },
  });
}
