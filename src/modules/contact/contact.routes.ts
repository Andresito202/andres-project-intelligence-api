import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import { createDb } from "../../db/client";
import { apiError, apiSuccess } from "../../lib/response";
import { rateLimit } from "../../middleware/rate-limit";
import type { AppBindings } from "../../types";
import { createContactMessage } from "./contact.repository";
import { createContactMessageSchema } from "./contact.schema";

export const contactRoutes = new Hono<AppBindings>();

contactRoutes.post(
  "/",
  rateLimit({ windowMs: 60_000, max: 3 }),
  zValidator("json", createContactMessageSchema, (result, c) => {
    if (!result.success) {
      return apiError(c, 400, "VALIDATION_ERROR", "Invalid contact message", result.error.issues);
    }
  }),
  async (c) => {
    const db = createDb(c.env);
    const message = await createContactMessage(db, c.req.valid("json"));

    return apiSuccess(
      c,
      {
        id: message.id,
        status: message.status,
        receivedAt: message.createdAt
      },
      201
    );
  }
);
