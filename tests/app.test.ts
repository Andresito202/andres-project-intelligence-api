import { describe, expect, it, vi } from "vitest";

import { createApp } from "../src/app";
import type { Env } from "../src/types";

const app = createApp();

const env = {
  DB: {} as D1Database,
  APP_ENV: "test",
  APP_VERSION: "1.0.0",
  ALLOWED_ORIGINS: "https://www.andrescamacho.dev,http://localhost:5173",
  ADMIN_API_KEY: "test-secret",
  TURNSTILE_DISABLED: "true",
  TURNSTILE_EXPECTED_ACTION: "portfolio_contact",
  TURNSTILE_EXPECTED_HOSTNAME: "www.andrescamacho.dev"
} satisfies Env;

describe("andres project intelligence api", () => {
  it("returns health information", async () => {
    const response = await app.request("/v1/health", {}, env);
    const body = await response.json() as { success: boolean; data: { status: string } };

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.status).toBe("ok");
  });

  it("exposes an OpenAPI document", async () => {
    const response = await app.request("/v1/openapi.json", {}, env);
    const body = await response.json() as { openapi: string; info: { title: string } };

    expect(response.status).toBe(200);
    expect(body.openapi).toBe("3.1.0");
    expect(body.info.title).toBe("Andres Project Intelligence API");
  });

  it("rejects admin calls without an API key", async () => {
    const response = await app.request(
      "/v1/admin/projects",
      {
        method: "POST",
        body: JSON.stringify({}),
        headers: { "content-type": "application/json" }
      },
      { ...env, ADMIN_API_KEY: "real-secret" }
    );
    const body = await response.json() as { success: boolean; error: { code: string } };

    expect(response.status).toBe(401);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("UNAUTHORIZED");
  });

  it("sets CORS only for allowed origins", async () => {
    const response = await app.request(
      "/v1/health",
      {
        headers: {
          origin: "https://www.andrescamacho.dev"
        }
      },
      env
    );

    expect(response.headers.get("access-control-allow-origin")).toBe("https://www.andrescamacho.dev");
  });

  it("requires a Turnstile token for contact messages", async () => {
    const response = await app.request(
      "/v1/contact",
      {
        method: "POST",
        body: JSON.stringify({
          name: "Andres",
          email: "andres@example.com",
          message: "This message is long enough to pass validation."
        }),
        headers: { "content-type": "application/json" }
      },
      env
    );
    const body = await response.json() as { success: boolean; error: { code: string } };

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });

  it("rejects production contact requests without an approved origin", async () => {
    const response = await app.request(
      "/v1/contact",
      {
        method: "POST",
        body: JSON.stringify({
          name: "Andres",
          email: "andres@example.com",
          message: "This message is long enough to pass validation.",
          turnstileToken: "test-token-123"
        }),
        headers: { "content-type": "application/json" }
      },
      { ...env, APP_ENV: "production" }
    );
    const body = await response.json() as { success: boolean; error: { code: string } };

    expect(response.status).toBe(403);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("ORIGIN_NOT_ALLOWED");
  });

  it("rejects failed Turnstile verification before storing a message", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(JSON.stringify({ success: false, "error-codes": ["invalid-input-response"] }), {
          headers: { "content-type": "application/json" }
        })
      )
    );

    const response = await app.request(
      "/v1/contact",
      {
        method: "POST",
        body: JSON.stringify({
          name: "Andres",
          email: "andres@example.com",
          message: "This message is long enough to pass validation.",
          turnstileToken: "test-token-123"
        }),
        headers: {
          "content-type": "application/json",
          origin: "https://www.andrescamacho.dev"
        }
      },
      {
        ...env,
        APP_ENV: "production",
        TURNSTILE_DISABLED: "false",
        TURNSTILE_SECRET_KEY: "test-secret"
      }
    );
    const body = await response.json() as { success: boolean; error: { code: string } };

    expect(response.status).toBe(403);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("CAPTCHA_FAILED");

    vi.unstubAllGlobals();
  });
});
