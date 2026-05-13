import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import { createDb } from "../../db/client";
import { notFound } from "../../lib/errors";
import { apiError, apiSuccess } from "../../lib/response";
import { requireAdmin } from "../../middleware/auth";
import type { AppBindings } from "../../types";
import { listContactMessages, updateContactMessageStatus } from "./contact.repository";
import { updateContactStatusSchema } from "./contact.schema";

export const adminContactRoutes = new Hono<AppBindings>();

adminContactRoutes.use("*", requireAdmin());

adminContactRoutes.get("/", async (c) => {
  const db = createDb(c.env);
  const rows = await listContactMessages(db);

  return apiSuccess(c, rows, 200, { count: rows.length });
});

adminContactRoutes.patch(
  "/:id/status",
  zValidator("json", updateContactStatusSchema, (result, c) => {
    if (!result.success) {
      return apiError(c, 400, "VALIDATION_ERROR", "Invalid message status", result.error.issues);
    }
  }),
  async (c) => {
    const db = createDb(c.env);
    const updated = await updateContactMessageStatus(db, c.req.param("id"), c.req.valid("json"));

    if (!updated) throw notFound("Contact message");

    return apiSuccess(c, updated);
  }
);
