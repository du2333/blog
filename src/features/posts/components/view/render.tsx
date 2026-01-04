import { renderToReactElement } from "@tiptap/static-renderer/pm/react";
import type { JSONContent } from "@tiptap/react";
import { CodeBlock } from "@/features/posts/components/view/code-block";
import { ImageDisplay } from "@/features/posts/components/view/image-display";
import { extensions } from "@/features/posts/editor/config";

export function renderReact(content: JSONContent) {
  return renderToReactElement({
    extensions,
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
            "blog image";

          return <ImageDisplay src={attrs.src} alt={alt} />;
        },
        codeBlock: ({ node }) => {
          const code = node.textContent || "";
          const language =
            (node.attrs as { language?: string | null }).language || null;

          return <CodeBlock code={code} language={language} />;
        },
      },
    },
  });
}
