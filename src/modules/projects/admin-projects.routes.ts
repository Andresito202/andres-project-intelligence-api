import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import { createDb } from "../../db/client";
import { notFound } from "../../lib/errors";
import { apiError, apiSuccess } from "../../lib/response";
import { requireAdmin } from "../../middleware/auth";
import type { AppBindings } from "../../types";
import { mapProject } from "./projects.mapper";
import { createProject, deleteProject, updateProject } from "./projects.repository";
import { createProjectSchema, updateProjectSchema } from "./projects.schema";

export const adminProjectsRoutes = new Hono<AppBindings>();

adminProjectsRoutes.use("*", requireAdmin());

adminProjectsRoutes.post(
  "/",
  zValidator("json", createProjectSchema, (result, c) => {
    if (!result.success) return apiError(c, 400, "VALIDATION_ERROR", "Invalid project payload", result.error.issues);
  }),
  async (c) => {
    const db = createDb(c.env);
    const created = await createProject(db, c.req.valid("json"));

    return apiSuccess(c, mapProject(created), 201);
  }
);

adminProjectsRoutes.patch(
  "/:id",
  zValidator("json", updateProjectSchema, (result, c) => {
    if (!result.success) return apiError(c, 400, "VALIDATION_ERROR", "Invalid project payload", result.error.issues);
  }),
  async (c) => {
    const db = createDb(c.env);
    const updated = await updateProject(db, c.req.param("id"), c.req.valid("json"));

    if (!updated) throw notFound("Project");

    return apiSuccess(c, mapProject(updated));
  }
);

adminProjectsRoutes.delete("/:id", async (c) => {
  const db = createDb(c.env);
  const deleted = await deleteProject(db, c.req.param("id"));

  if (!deleted) throw notFound("Project");

  return apiSuccess(c, { deleted: true, id: deleted.id });
});
