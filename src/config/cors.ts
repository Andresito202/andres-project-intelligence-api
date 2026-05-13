import { cors } from "hono/cors";
import type { MiddlewareHandler } from "hono";

import { getAllowedOrigins } from "./env";
import type { AppBindings } from "../types";

export function corsMiddleware(): MiddlewareHandler<AppBindings> {
  return cors({
    origin: (origin, c) => {
      if (!origin) return null;
      const allowedOrigins = getAllowedOrigins(c.env);
      return allowedOrigins.includes(origin) ? origin : null;
    },
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "X-API-Key", "X-Request-ID"],
    exposeHeaders: ["X-Request-ID"],
    credentials: false,
    maxAge: 86400
  });
}
