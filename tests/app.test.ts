import { describe, expect, it } from "vitest";

import { createApp } from "../src/app";
import type { Env } from "../src/types";

const app = createApp();

const env = {
  DB: {} as D1Database,
  APP_ENV: "test",
  APP_VERSION: "1.0.0",
  ALLOWED_ORIGINS: "https://www.andrescamacho.dev,http://localhost:5173",
  ADMIN_API_KEY: "test-secret"
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
});
