import { createFileRoute } from "@tanstack/react-router";
import { Feed } from "feed";
import { and, desc, eq, lte } from "drizzle-orm";
import { blogConfig } from "@/blog.config";
import { serverEnv } from "@/lib/env/server.env";
import { PostsTable } from "@/lib/db/schema";
import { getDb } from "@/lib/db";
import { convertToPlainText } from "@/features/posts/utils/content";

export const Route = createFileRoute("/rss.xml")({
  server: {
    handlers: {
      GET: async ({ context: { env } }) => {
        const db = getDb(env);
        const posts = await db
          .select({
            id: PostsTable.id,
            title: PostsTable.title,
            summary: PostsTable.summary,
            contentJson: PostsTable.contentJson,
            slug: PostsTable.slug,
            publishedAt: PostsTable.publishedAt,
            updatedAt: PostsTable.updatedAt,
          })
          .from(PostsTable)
          .where(
            and(
              eq(PostsTable.status, "published"),
              lte(PostsTable.publishedAt, new Date()),
            ),
          )
          .orderBy(desc(PostsTable.publishedAt))
          .limit(100);
        const { DOMAIN, ADMIN_EMAIL } = serverEnv(env);
        const year = new Date().getFullYear();

        const feed = new Feed({
          title: blogConfig.title,
          description: blogConfig.description,
          id: `https://${DOMAIN}/`,
          link: `https://${DOMAIN}/`,
          favicon: `https://${DOMAIN}/favicon.ico`,
          copyright: `All rights reserved ${year}, ${blogConfig.author}`,
          generator: blogConfig.title,
          author: {
            name: blogConfig.author,
            email: ADMIN_EMAIL,
            link: `https://${DOMAIN}/`,
          },
        });

        posts.forEach((post) => {
          feed.addItem({
            title: post.title,
            id: post.id.toString(),
            link: `https://${DOMAIN}/post/${encodeURIComponent(post.slug)}`,
            description: post.summary ?? "",
            content: convertToPlainText(post.contentJson),
            author: [
              {
                name: blogConfig.author,
                email: ADMIN_EMAIL,
                link: `https://${DOMAIN}/`,
              },
            ],
            date: post.publishedAt ?? post.updatedAt,
          });
        });

        return new Response(feed.rss2(), {
          headers: {
            "Content-Type": "application/rss+xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=3600",
          },
        });
      },
    },
  },
});
