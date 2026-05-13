import { createMiddleware } from "hono/factory";

import { apiError } from "../lib/response";
import type { AppBindings } from "../types";

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export function rateLimit(options: { windowMs: number; max: number }) {
  return createMiddleware<AppBindings>(async (c, next) => {
    const ip = c.req.header("cf-connecting-ip") ?? c.req.header("x-forwarded-for") ?? "anonymous";
    const key = `${c.req.path}:${ip}`;
    const now = Date.now();
    const current = buckets.get(key);

    if (!current || current.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + options.windowMs });
      await next();
      return;
    }

    if (current.count >= options.max) {
      const retryAfterSeconds = Math.ceil((current.resetAt - now) / 1000);
      c.header("Retry-After", String(retryAfterSeconds));
      return apiError(c, 429, "RATE_LIMITED", "Too many requests, try again later");
    }

    current.count += 1;
    await next();
  });
}
