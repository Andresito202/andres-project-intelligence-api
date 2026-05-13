import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

import { getAppVersion } from "../config/env";
import type { Env } from "../types";

type Meta = Record<string, unknown>;
type ApiContext = Context<any>;

function requestIdFrom(c: ApiContext): string {
  try {
    return c.get("requestId") ?? "unknown";
  } catch {
    return "unknown";
  }
}

function versionFrom(c: ApiContext): string {
  return getAppVersion((c.env ?? {}) as Env);
}

export function apiSuccess<T>(
  c: ApiContext,
  data: T,
  status: ContentfulStatusCode = 200,
  meta: Meta = {}
) {
  return c.json(
    {
      success: true,
      data,
      meta: {
        requestId: requestIdFrom(c),
        version: versionFrom(c),
        ...meta
      }
    },
    status
  );
}

export function apiError(
  c: ApiContext,
  status: ContentfulStatusCode,
  code: string,
  message: string,
  details?: unknown
) {
  return c.json(
    {
      success: false,
      data: null,
      error: {
        code,
        message,
        details
      },
      meta: {
        requestId: requestIdFrom(c),
        version: versionFrom(c)
      }
    },
    status
  );
}
