import type { ErrorHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { ZodError } from "zod";

import { AppError } from "../lib/errors";
import { apiError } from "../lib/response";
import type { AppBindings } from "../types";

export const errorHandler: ErrorHandler<AppBindings> = (error, c) => {
  if (error instanceof AppError) {
    return apiError(c, error.status, error.code, error.message, error.details);
  }

  if (error instanceof HTTPException) {
    return apiError(c, error.status, "HTTP_ERROR", error.message);
  }

  if (error instanceof ZodError) {
    return apiError(c, 400, "VALIDATION_ERROR", "Request validation failed", error.issues);
  }

  console.error("Unhandled API error", {
    requestId: c.get("requestId"),
    error
  });

  return apiError(c, 500, "INTERNAL_ERROR", "An unexpected error occurred");
};
