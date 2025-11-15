import { handleImageRequest } from "@/lib/images";
import { createFileRoute } from "@tanstack/react-router";

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
          return await handleImageRequest(key, request, true);
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
          return await handleImageRequest(key, request, false);
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
