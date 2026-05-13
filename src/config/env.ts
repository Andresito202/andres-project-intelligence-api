import type { Env } from "../types";

const DEFAULT_ALLOWED_ORIGINS = [
  "https://www.andrescamacho.dev",
  "http://localhost:5173"
];

export function getAllowedOrigins(env: Env): string[] {
  return (env.ALLOWED_ORIGINS ?? DEFAULT_ALLOWED_ORIGINS.join(","))
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function getAppVersion(env: Env): string {
  return env.APP_VERSION ?? "1.0.0";
}

export function getAppEnvironment(env: Env): string {
  return env.APP_ENV ?? "development";
}
