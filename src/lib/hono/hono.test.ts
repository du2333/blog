import { env } from "cloudflare:test";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { app } from "@/lib/hono";

describe("Hono Integration Test", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should block requests when rate limit exceeded", async () => {
    const reqInit = {
      method: "POST",
      headers: {
        "cf-connecting-ip": "bad-ip",
      },
    };

    const url = "/api/auth/sign-in/email";

    for (let i = 0; i < 10; i++) {
      const res = await app.request(url, reqInit, env);
      expect(res.status).not.toBe(429);
    }

    const res = await app.request(url, reqInit, env);
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ message: "Too Many Requests" });
    expect(res.headers.get("Retry-After")).toBeDefined();
  });
});
