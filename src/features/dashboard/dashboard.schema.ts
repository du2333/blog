import { z } from "zod";

export const DashboardStatsSchema = z.object({
  pendingComments: z.number(),
  publishedPosts: z.number(),
  drafts: z.number(),
  mediaSize: z.number(),
});

export const ActivityLogItemSchema = z.object({
  type: z.enum(["comment", "post", "user"]),
  text: z.string(),
  time: z.date().nullable(),
  link: z.string().optional(),
  rootId: z.number().optional(),
});

export const TrafficDataSchema = z.object({
  date: z.number(),
  views: z.number(),
});

export const DashboardResponseSchema = z.object({
  stats: DashboardStatsSchema,
  activities: z.array(ActivityLogItemSchema),
  traffic: z.array(TrafficDataSchema).optional(),
  overview: z
    .object({
      visitors: z.number(),
      pageViews: z.number(),
    })
    .optional(),
  umamiUrl: z.string().optional(),
  lastUpdated: z.number().optional(),
});

export const DashboardQuerySchema = z.object({
  range: z.enum(["24h", "7d", "30d", "90d"]).default("24h"),
});

export type DashboardStats = z.infer<typeof DashboardStatsSchema>;
export type ActivityLogItem = z.infer<typeof ActivityLogItemSchema>;
export type TrafficData = z.infer<typeof TrafficDataSchema>;
export type DashboardResponse = z.infer<typeof DashboardResponseSchema>;
export type DashboardQuery = z.infer<typeof DashboardQuerySchema>;
