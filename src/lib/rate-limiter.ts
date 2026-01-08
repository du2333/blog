import { DurableObject } from "cloudflare:workers";
import type { Duration } from "@/lib/duration";
import { ms } from "@/lib/duration";

interface BucketState {
  tokens: number;
  lastRefill: number;
}

export type RateLimitOptions = {
  capacity: number;
  interval: Duration;
  cost?: number;
};

export class RateLimiter extends DurableObject {
  private state: BucketState;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.state = {
      tokens: 0,
      lastRefill: 0,
    };

    ctx.blockConcurrencyWhile(async () => {
      const stored = await ctx.storage.get<BucketState>("bucket");
      if (stored) {
        this.state = stored;
      }
    });
  }

  checkLimit({ capacity, interval, cost = 1 }: RateLimitOptions): {
    allowed: boolean;
    remaining: number;
    retryAfterMs: number;
  } {
    if (cost > capacity) {
      return {
        allowed: false,
        remaining: 0,
        retryAfterMs: -1,
      };
    }

    const now = Date.now();
    const intervalMs = ms(interval);
    const rate = capacity / intervalMs;

    // 初始化
    if (this.state.lastRefill === 0) {
      this.state.lastRefill = now;
      this.state.tokens = capacity;
    }

    // 计算新令牌数（不立即更新状态）
    const timeSinceLastRefill = now - this.state.lastRefill;
    const tokensToAdd = timeSinceLastRefill * rate;
    const currentTokens = Math.min(capacity, this.state.tokens + tokensToAdd);

    // 检查是否有足够令牌
    if (currentTokens < cost) {
      return {
        allowed: false,
        remaining: Math.floor(currentTokens),
        retryAfterMs: Math.ceil((cost - currentTokens) / rate),
      };
    }

    // 允许请求，更新状态
    this.state.tokens = currentTokens - cost;
    this.state.lastRefill = now;
    this.ctx.waitUntil(this.ctx.storage.put("bucket", this.state));

    return {
      allowed: true,
      remaining: Math.floor(this.state.tokens),
      retryAfterMs: 0,
    };
  }
}
