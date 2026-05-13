import { Hono } from "hono";
import { swaggerUI } from "@hono/swagger-ui";

import { corsMiddleware } from "./config/cors";
import { openApiDocument } from "./docs/openapi";
import { apiError, apiSuccess } from "./lib/response";
import { errorHandler } from "./middleware/error-handler";
import { requestId } from "./middleware/request-id";
import { adminContactRoutes } from "./modules/contact/admin-contact.routes";
import { contactRoutes } from "./modules/contact/contact.routes";
import { caseStudiesRoutes } from "./modules/case-studies/case-studies.routes";
import { healthRoutes } from "./modules/health/health.routes";
import { adminProjectsRoutes } from "./modules/projects/admin-projects.routes";
import { projectsRoutes } from "./modules/projects/projects.routes";
import { repoStatusRoutes } from "./modules/repo-status/repo-status.routes";
import { skillsRoutes } from "./modules/skills/skills.routes";
import type { AppBindings } from "./types";

export function createApp() {
  const app = new Hono<AppBindings>();

  app.use("*", requestId());
  app.use("*", corsMiddleware());
  app.onError(errorHandler);

  app.get("/", (c) =>
    apiSuccess(c, {
      service: "andres-project-intelligence-api",
      documentation: "/v1/openapi.json",
      health: "/v1/health"
    })
  );

  app.route("/v1/health", healthRoutes);
  app.route("/v1/projects", projectsRoutes);
  app.route("/v1/skills", skillsRoutes);
  app.route("/v1/case-studies", caseStudiesRoutes);
  app.route("/v1/repo-status", repoStatusRoutes);
  app.route("/v1/contact", contactRoutes);
  app.route("/v1/admin/projects", adminProjectsRoutes);
  app.route("/v1/admin/messages", adminContactRoutes);

  app.get("/v1/openapi.json", (c) => c.json(openApiDocument));
  app.get("/v1/docs", swaggerUI({ url: "/v1/openapi.json" }));

  app.notFound((c) => apiError(c, 404, "NOT_FOUND", "Route not found"));

  return app;
}
