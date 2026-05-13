import { createMiddleware } from "hono/factory";

import type { AppBindings } from "../types";

export const requestId = () =>
  createMiddleware<AppBindings>(async (c, next) => {
    const requestId = c.req.header("x-request-id") ?? crypto.randomUUID();
    c.set("requestId", requestId);
    await next();
    c.header("X-Request-ID", requestId);
  });
