import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async ({ context: { env } }) => {
        const robots = `User-agent: *
Allow: /
Disallow: /admin
Sitemap: https://${env.DOMAIN}/sitemap.xml`;

        return new Response(robots, {
          headers: {
            "Content-Type": "text/plain",
            "Cache-Control": "public, max-age=86400, s-maxage=86400",
          },
        });
      },
    },
  },
});
