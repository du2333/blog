import { z } from "zod";
import { UmamiClient } from "./services/umami-client";
import type {
  DashboardQuery,
  DashboardResponse,
} from "@/features/dashboard/dashboard.schema";
import {
  DASHBOARD_CACHE_KEYS,
  TrafficDataSchema,
} from "@/features/dashboard/dashboard.schema";
import * as DashboardRepo from "@/features/dashboard/data/dashboard.data";
import * as MediaRepo from "@/features/media/data/media.data";
import * as CacheService from "@/features/cache/cache.service";
import { serverEnv } from "@/lib/env/server.env";

const CachedUmamiDataSchema = z.object({
  traffic: z.array(TrafficDataSchema).optional(),
  overview: z
    .object({
      visitors: z.number(),
      pageViews: z.number(),
    })
    .optional(),
  lastUpdated: z.number(),
});

export async function getDashboardStats(
  context: DbContext & { executionCtx: ExecutionContext },
  query: DashboardQuery,
): Promise<DashboardResponse> {
  const { db } = context;
  const { range } = query;

  const [
    pendingComments,
    publishedPosts,
    drafts,
    mediaSize,
    recentComments,
    recentPosts,
    recentUsers,
  ] = await Promise.all([
    DashboardRepo.getPendingCommentsCount(db),
    DashboardRepo.getPublishedPostsCount(db),
    DashboardRepo.getDraftsCount(db),
    MediaRepo.getTotalMediaSize(db),
    DashboardRepo.getRecentComments(db, 10),
    DashboardRepo.getRecentPosts(db, 10),
    DashboardRepo.getRecentUsers(db, 10),
  ]);

  const env = serverEnv(context.env);
  let traffic;
  let overview;

  let umamiUrl;
  let lastUpdated;

  const umamiWebsiteId = env.VITE_UMAMI_WEBSITE_ID;
  const umamiSrc = env.VITE_UMAMI_SRC;

  if (umamiWebsiteId && umamiSrc) {
    // Construct external link
    umamiUrl = `${umamiSrc.replace(/\/$/, "")}/websites/${umamiWebsiteId}`;

    // define fetcher for cache
    const fetcher = async () => {
      const umami = new UmamiClient({
        websiteId: umamiWebsiteId,
        src: umamiSrc,
        apiKey: env.UMAMI_API_KEY,
        username: env.UMAMI_USERNAME,
        password: env.UMAMI_PASSWORD,
      });
      const now = new Date();
      const endAt = now.getTime();
      let startAt: number;

      // Use if/else to avoid any switch scope ambiguity
      if (range === "24h") {
        const d = new Date(now);
        d.setHours(d.getHours() - 24, 0, 0, 0);
        startAt = d.getTime();
      } else if (range === "7d") {
        const d = new Date(now);
        d.setDate(d.getDate() - 7);
        d.setHours(0, 0, 0, 0);
        startAt = d.getTime();
      } else if (range === "30d") {
        const d = new Date(now);
        d.setDate(d.getDate() - 30);
        d.setHours(0, 0, 0, 0);
        startAt = d.getTime();
      } else {
        // 90d (default)
        const d = new Date(now);
        d.setDate(d.getDate() - 90);
        d.setHours(0, 0, 0, 0);
        startAt = d.getTime();
      }

      const unit = range === "24h" ? "hour" : "day";

      const [stats, pageViews] = await Promise.all([
        umami.getStats(startAt, endAt),
        umami.getPageViews(startAt, endAt, unit),
      ]);

      let cachedOverview;
      const cachedTraffic: Array<{ date: number; views: number }> = [];

      if (stats) {
        cachedOverview = {
          visitors: stats.visitors,
          pageViews: stats.pageviews,
        };
      }

      if (pageViews?.pageviews) {
        const rawData = new Map<number, number>();
        pageViews.pageviews.forEach((p: { x: string; y: number }) => {
          const d = new Date(p.x);
          if (range === "24h") d.setMinutes(0, 0, 0);
          else d.setHours(0, 0, 0, 0);
          rawData.set(d.getTime(), p.y);
        });

        // Fill gaps using Date increment to handle DST correctly
        const loopEnd =
          range === "24h"
            ? new Date(now).setMinutes(0, 0, 0)
            : new Date(now).setHours(0, 0, 0, 0);

        const current = new Date(startAt);
        while (current.getTime() <= loopEnd) {
          const t = current.getTime();
          cachedTraffic.push({
            date: t,
            views: rawData.get(t) || 0,
          });

          if (range === "24h") {
            current.setHours(current.getHours() + 1);
          } else {
            current.setDate(current.getDate() + 1);
            current.setHours(0, 0, 0, 0); // Ensure midnight alignment
          }
        }
      }

      return {
        overview: cachedOverview,
        traffic: cachedTraffic,
        lastUpdated: Date.now(),
      };
    };

    // 3 hours TTL for 24h, 6h for others
    const ttl = range === "24h" ? "3h" : "6h";

    const cachedData = await CacheService.get(
      context,
      DASHBOARD_CACHE_KEYS.umamiStats(range),
      CachedUmamiDataSchema,
      fetcher,
      { ttl },
    );

    overview = cachedData.overview;
    traffic = cachedData.traffic;
    lastUpdated = cachedData.lastUpdated;
  }

  const activities = [
    ...recentComments
      .filter((c) => c.posts !== null)
      .map((c) => ({
        type: "comment" as const,
        text: `用户 ${c.user?.name || "Anonymous"} 在《${c.posts!.title}》下评论了`,
        time: c.comments.createdAt,
        link: `/post/${c.posts!.slug}?highlightCommentId=${c.comments.id}&rootId=${c.comments.rootId ?? c.comments.id}#comment-${c.comments.id}`,
        rootId: c.comments.rootId ?? c.comments.id,
      })),
    ...recentPosts.map((p) => ({
      type: "post" as const,
      text: `文章《${p.title}》已发布`,
      time: p.publishedAt,
      link: `/post/${p.slug}`,
    })),
    ...recentUsers.map((u) => ({
      type: "user" as const,
      text: `新用户 ${u.name} 注册了`,
      time: u.createdAt,
    })),
  ]
    .sort((a, b) => {
      const timeA = a.time ? new Date(a.time).getTime() : 0;
      const timeB = b.time ? new Date(b.time).getTime() : 0;
      return timeB - timeA;
    })
    .slice(0, 10);

  return {
    stats: {
      pendingComments,
      publishedPosts,
      drafts,
      mediaSize,
    },
    activities,
    traffic,
    overview,
    umamiUrl,
    lastUpdated,
  };
}
