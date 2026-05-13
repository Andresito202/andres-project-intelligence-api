import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import { createDb } from "../../db/client";
import { notFound } from "../../lib/errors";
import { apiError, apiSuccess } from "../../lib/response";
import type { AppBindings } from "../../types";
import { getCaseStudyBySlug, listCaseStudies } from "./case-studies.repository";
import { caseStudyListQuerySchema } from "./case-studies.schema";

export const caseStudiesRoutes = new Hono<AppBindings>();

caseStudiesRoutes.get(
  "/",
  zValidator("query", caseStudyListQuerySchema, (result, c) => {
    if (!result.success) return apiError(c, 400, "VALIDATION_ERROR", "Invalid case study filters", result.error.issues);
  }),
  async (c) => {
    const db = createDb(c.env);
    const rows = await listCaseStudies(db, c.req.valid("query"));

    return apiSuccess(c, rows, 200, { count: rows.length });
  }
);

caseStudiesRoutes.get("/:slug", async (c) => {
  const db = createDb(c.env);
  const row = await getCaseStudyBySlug(db, c.req.param("slug"));

  if (!row) throw notFound("Case study");

  return apiSuccess(c, row);
});
