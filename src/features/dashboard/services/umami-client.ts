import { z } from "zod";
import type { SystemConfig } from "@/features/config/config.schema";

// --- Schemas ---
const UmamiMetricSchema = z
  .object({
    value: z.number(),
    prev: z.number().optional(),
  })
  .transform((d) => d.value)
  .or(z.number()); // Fallback if it returns raw number (unlikely in V2 but safe)

export const UmamiStatsResponseSchema = z.object({
  pageviews: UmamiMetricSchema,
  visitors: UmamiMetricSchema,
  visits: UmamiMetricSchema,
  bounces: UmamiMetricSchema,
  totaltime: UmamiMetricSchema,
});

const UmamiChartDataSchema = z.object({
  x: z.string(),
  y: z.number(),
});

export const UmamiPageViewsResponseSchema = z.object({
  pageviews: z.array(UmamiChartDataSchema),
  sessions: z.array(UmamiChartDataSchema),
});

export type UmamiStats = z.infer<typeof UmamiStatsResponseSchema>;
export type UmamiChartData = z.infer<typeof UmamiChartDataSchema>;

// --- Client ---

export class UmamiClient {
  private baseUrl: string;
  private websiteId: string;
  private apiKey?: string;
  private username?: string;
  private password?: string;
  private token: string | null = null;

  constructor(config: NonNullable<SystemConfig["umami"]>) {
    this.baseUrl = config.src.replace(/\/$/, "");
    this.websiteId = config.websiteId;
    this.apiKey = config.apiKey;
    this.username = config.username;
    this.password = config.password;
  }

  private async login(): Promise<string | null> {
    if (!this.username || !this.password) return null;

    try {
      const res = await fetch(`${this.baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: this.username,
          password: this.password,
        }),
      });

      if (!res.ok) return null;

      const data = await res.json();
      // V2 login returns { token: string, user: ... }
      const schema = z.object({ token: z.string() });
      const parsed = schema.safeParse(data);
      if (parsed.success) {
        this.token = parsed.data.token;
        return parsed.data.token;
      }
      return null;
    } catch (error) {
      console.error("Umami login failed:", error);
      return null;
    }
  }

  private async getHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.apiKey) {
      // Cloud / V2 API Key auth
      headers["x-umami-api-key"] = this.apiKey;
    } else {
      // Self-hosted / User-Pass auth
      if (!this.token) {
        await this.login();
      }
      if (this.token) {
        headers["Authorization"] = `Bearer ${this.token}`;
      }
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    schema: z.ZodType<T>,
    params: Record<string, string | number> = {},
  ): Promise<T | null> {
    try {
      const url = new URL(
        `${this.baseUrl}/api/websites/${this.websiteId}${endpoint}`,
      );
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });

      let headers = await this.getHeaders();
      let res = await fetch(url.toString(), { headers });

      // Retry on 401 if using token (expired)
      if (res.status === 401 && !this.apiKey && this.username) {
        this.token = null;
        headers = await this.getHeaders();
        // Only retry if we got a new token/headers
        if (headers["Authorization"]) {
          res = await fetch(url.toString(), { headers });
        }
      }

      if (!res.ok) {
        console.error(`Umami API error: ${res.status} ${res.statusText}`);
        return null;
      }

      const data = await res.json();
      const parsed = schema.safeParse(data);

      if (!parsed.success) {
        console.error("Umami API schema validation failed:", parsed.error);
        return null;
      }

      return parsed.data;
    } catch (error) {
      console.error("Umami client error:", error);
      return null;
    }
  }

  async getStats(startAt: number, endAt: number): Promise<UmamiStats | null> {
    return this.request("/stats", UmamiStatsResponseSchema, {
      startAt,
      endAt,
    });
  }

  async getPageViews(
    startAt: number,
    endAt: number,
    unit: "hour" | "day" = "day",
  ): Promise<{
    pageviews: Array<UmamiChartData>;
    sessions: Array<UmamiChartData>;
  } | null> {
    return this.request("/pageviews", UmamiPageViewsResponseSchema, {
      startAt,
      endAt,
      unit,
    });
  }
}
