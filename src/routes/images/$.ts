import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";

export const Route = createFileRoute("/images/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        // 使用 _splat 获取所有路径段（包含斜杠）
        const key = params._splat;
        
        if (!key) {
          return new Response("Image key is required", {
            status: 400,
          });
        }

        try {
          // 从 R2 获取图片对象
          const object = await env.R2.get(key);

          if (!object) {
            return new Response("Image not found", {
              status: 404,
            });
          }

          // 获取 Content-Type，如果没有则根据文件扩展名推断
          const contentType =
            object.httpMetadata?.contentType ||
            getContentTypeFromKey(key) ||
            "application/octet-stream";

          // 返回图片响应
          return new Response(object.body, {
            headers: {
              "Content-Type": contentType,
              "Cache-Control": "public, max-age=31536000, immutable",
            },
          });
        } catch (error) {
          console.error("Error fetching image from R2:", error);
          return new Response("Internal server error", {
            status: 500,
          });
        }
      },
    },
  },
});

// 根据文件扩展名推断 Content-Type
function getContentTypeFromKey(key: string): string | undefined {
  const extension = key.split(".").pop()?.toLowerCase();
  const contentTypes: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    svg: "image/svg+xml",
  };
  return contentTypes[extension || ""];
}
