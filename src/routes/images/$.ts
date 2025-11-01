import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";
import { handleImageRequest } from "@/core/helpers/images";

export const Route = createFileRoute("/images/$")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const key = params._splat;

        if (!key) {
          return new Response("Image key is required", {
            status: 400,
            headers: { "Content-Type": "text/plain" },
          });
        }

        try {
          return await handleImageRequest(key, request, env.R2, true);
        } catch (error) {
          console.error("Error fetching image from R2:", error);
          return new Response("Internal server error", {
            status: 500,
            headers: { "Content-Type": "text/plain" },
          });
        }
      },

      HEAD: async ({ params, request }) => {
        const key = params._splat;

        if (!key) {
          return new Response(null, {
            status: 400,
            headers: { "Content-Type": "text/plain" },
          });
        }

        try {
          return await handleImageRequest(key, request, env.R2, false);
        } catch (error) {
          console.error("Error checking image from R2:", error);
          return new Response(null, {
            status: 500,
            headers: { "Content-Type": "text/plain" },
          });
        }
      },
    },
  },
});
