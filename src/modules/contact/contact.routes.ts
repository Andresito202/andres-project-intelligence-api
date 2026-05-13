import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import { getAllowedOrigins } from "../../config/env";
import { createDb } from "../../db/client";
import { apiError, apiSuccess } from "../../lib/response";
import { rateLimit } from "../../middleware/rate-limit";
import type { AppBindings } from "../../types";
import { notifyContactMessage } from "./contact-notifier";
import { createContactMessage } from "./contact.repository";
import { createContactMessageSchema } from "./contact.schema";
import { verifyTurnstileToken } from "./turnstile";

export const contactRoutes = new Hono<AppBindings>();

contactRoutes.post(
  "/",
  async (c, next) => {
    const origin = c.req.header("origin");
    const allowedOrigins = getAllowedOrigins(c.env);

    if (c.env.APP_ENV === "production" && (!origin || !allowedOrigins.includes(origin))) {
      return apiError(c, 403, "ORIGIN_NOT_ALLOWED", "Contact messages must come from an approved portfolio origin");
    }

    await next();
  },
  rateLimit({ windowMs: 10 * 60_000, max: 3 }),
  zValidator("json", createContactMessageSchema, (result, c) => {
    if (!result.success) {
      return apiError(c, 400, "VALIDATION_ERROR", "Invalid contact message", result.error.issues);
    }
  }),
  async (c) => {
    const input = c.req.valid("json");

    if (input.botcheck.trim().length > 0) {
      return apiError(c, 400, "SPAM_DETECTED", "Invalid contact message");
    }

    const remoteIp = c.req.header("cf-connecting-ip") ?? c.req.header("x-forwarded-for");
    const captcha = await verifyTurnstileToken(c.env, input.turnstileToken, remoteIp);

    if (!captcha.success) {
      const status = captcha.errorCode === "CAPTCHA_NOT_CONFIGURED" ? 500 : 403;
      return apiError(c, status, captcha.errorCode, "Captcha verification failed", captcha.details);
    }

    const db = createDb(c.env);
    const message = await createContactMessage(db, input);
    const notification = await notifyContactMessage(c.env, input, message.id);

    if (c.env.CONTACT_NOTIFICATION_REQUIRED === "true" && notification.status !== "sent") {
      return apiError(c, 502, "CONTACT_NOTIFICATION_FAILED", "Message was stored but email delivery failed", notification);
    }

    return apiSuccess(
      c,
      {
        id: message.id,
        status: message.status,
        receivedAt: message.createdAt,
        notification
      },
      201
    );
  }
);
