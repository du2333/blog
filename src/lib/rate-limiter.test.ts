import { env } from "cloudflare:test";
import { afterEach, beforeEach, describe, expect, it, vi, } from "vitest";

describe("RateLimiter", () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it("should allow request if there are enough tokens", async () => {
        const id = env.RATE_LIMITER.idFromName("user-1");
        const rateLimiter = env.RATE_LIMITER.get(id);

        const result = await rateLimiter.checkLimit({ capacity: 5, interval: "1m" });

        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(4);
        expect(result.retryAfterMs).toBe(0);
    })

    it("should reject request if there are not enough tokens", async () => {
        const id = env.RATE_LIMITER.idFromName("user-2");
        const rateLimiter = env.RATE_LIMITER.get(id);

        for (let i = 0; i < 5; i++) {
            await rateLimiter.checkLimit({ capacity: 5, interval: "1m" });
        }

        const result = await rateLimiter.checkLimit({ capacity: 5, interval: "1m" });

        expect(result.allowed).toBe(false);
        expect(result.remaining).toBe(0);
    })

    it("should reject request if cost is greater than capacity", async () => {
        const id = env.RATE_LIMITER.idFromName("user-3");
        const rateLimiter = env.RATE_LIMITER.get(id);

        const result = await rateLimiter.checkLimit({ capacity: 5, interval: "1m", cost: 6 });

        expect(result.allowed).toBe(false);
        expect(result.remaining).toBe(0);
        expect(result.retryAfterMs).toBe(-1);
    })

    it("should refill tokens after time passes", async () => {
        const id = env.RATE_LIMITER.idFromName("user-4");
        const rateLimiter = env.RATE_LIMITER.get(id);

        const config = { capacity: 5, interval: "1m" as const };

        for (let i = 0; i < 5; i++) {
            await rateLimiter.checkLimit(config);
        }

        await vi.advanceTimersByTimeAsync(11900);

        const result = await rateLimiter.checkLimit(config);
        expect(result.allowed).toBe(false);

        //  再过 0.2 秒 (总共 12.1 秒)
        await vi.advanceTimersByTimeAsync(200);

        const resultSuccess = await rateLimiter.checkLimit(config);
        expect(resultSuccess.allowed).toBe(true);
    })

    it("should correctly calculate retry after time", async () => {
        const id = env.RATE_LIMITER.idFromName("user-5");
        const rateLimiter = env.RATE_LIMITER.get(id);

        const result = await rateLimiter.checkLimit({ capacity: 5, interval: "1m" });

        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(4);
        expect(result.retryAfterMs).toBe(0);

        for (let i = 0; i < 4; i++) {
            await rateLimiter.checkLimit({ capacity: 5, interval: "1m" });
        }

        const rejected = await rateLimiter.checkLimit({ capacity: 5, interval: "1m" });

        expect(rejected.allowed).toBe(false);
        expect(rejected.remaining).toBe(0);
        expect(rejected.retryAfterMs).toBe(12 * 1000);
    })

    it("should handle custom cost", async () => {
        const id = env.RATE_LIMITER.idFromName("user-6");
        const rateLimiter = env.RATE_LIMITER.get(id);

        const result = await rateLimiter.checkLimit({ capacity: 5, interval: "1m", cost: 2 });

        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(3);
        expect(result.retryAfterMs).toBe(0);
    })
})