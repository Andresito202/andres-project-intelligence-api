import { Hono } from "hono";

import { getAppEnvironment, getAppVersion } from "../../config/env";
import { apiSuccess } from "../../lib/response";
import type { AppBindings } from "../../types";

export const healthRoutes = new Hono<AppBindings>();

healthRoutes.get("/", (c) => {
  return apiSuccess(c, {
    service: "andres-project-intelligence-api",
    status: "ok",
    environment: getAppEnvironment(c.env),
    version: getAppVersion(c.env),
    timestamp: new Date().toISOString()
  });
});
