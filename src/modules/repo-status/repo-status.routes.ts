import { Hono } from "hono";

import { createDb } from "../../db/client";
import { notFound } from "../../lib/errors";
import { apiSuccess } from "../../lib/response";
import type { AppBindings } from "../../types";
import { getRepoStatusByProjectSlug, listRepoStatus } from "./repo-status.repository";

export const repoStatusRoutes = new Hono<AppBindings>();

repoStatusRoutes.get("/", async (c) => {
  const db = createDb(c.env);
  const rows = await listRepoStatus(db);

  return apiSuccess(c, rows, 200, { count: rows.length });
});

repoStatusRoutes.get("/:projectSlug", async (c) => {
  const db = createDb(c.env);
  const row = await getRepoStatusByProjectSlug(db, c.req.param("projectSlug"));

  if (!row) throw notFound("Repository status");

  return apiSuccess(c, row);
});
