import { createMiddleware } from "hono/factory";

import { apiError } from "../lib/response";
import type { AppBindings } from "../types";

export const requireAdmin = () =>
  createMiddleware<AppBindings>(async (c, next) => {
    const configuredKey = c.env.ADMIN_API_KEY;
    const providedKey = c.req.header("x-api-key") ?? c.req.header("authorization")?.replace(/^Bearer\s+/i, "");

    if (!configuredKey || providedKey !== configuredKey) {
      return apiError(c, 401, "UNAUTHORIZED", "A valid admin API key is required");
    }

    await next();
  });
