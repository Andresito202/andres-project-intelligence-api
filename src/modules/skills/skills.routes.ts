import { Hono } from "hono";

import { createDb } from "../../db/client";
import { apiSuccess } from "../../lib/response";
import type { AppBindings } from "../../types";
import { listSkills } from "./skills.repository";

export const skillsRoutes = new Hono<AppBindings>();

skillsRoutes.get("/", async (c) => {
  const db = createDb(c.env);
  const rows = await listSkills(db);

  return apiSuccess(c, rows, 200, { count: rows.length });
});
