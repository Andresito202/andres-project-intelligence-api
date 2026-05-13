import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import { createDb } from "../../db/client";
import { notFound } from "../../lib/errors";
import { apiError, apiSuccess } from "../../lib/response";
import type { AppBindings } from "../../types";
import { mapProject } from "./projects.mapper";
import { getProjectBySlug, listProjects } from "./projects.repository";
import { projectListQuerySchema } from "./projects.schema";

export const projectsRoutes = new Hono<AppBindings>();

projectsRoutes.get(
  "/",
  zValidator("query", projectListQuerySchema, (result, c) => {
    if (!result.success) return apiError(c, 400, "VALIDATION_ERROR", "Invalid project filters", result.error.issues);
  }),
  async (c) => {
    const db = createDb(c.env);
    const query = c.req.valid("query");
    const rows = await listProjects(db, query);

    return apiSuccess(c, rows.map(mapProject), 200, { count: rows.length });
  }
);

projectsRoutes.get("/:slug", async (c) => {
  const db = createDb(c.env);
  const project = await getProjectBySlug(db, c.req.param("slug"));

  if (!project) throw notFound("Project");

  return apiSuccess(c, mapProject(project));
});
