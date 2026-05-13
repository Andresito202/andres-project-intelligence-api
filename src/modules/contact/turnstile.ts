import type { Env } from "../../types";

const TURNSTILE_SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const DEFAULT_EXPECTED_ACTION = "portfolio_contact";
const SITEVERIFY_TIMEOUT_MS = 4_000;

type TurnstileSiteverifyResponse = {
  success: boolean;
  "error-codes"?: string[];
  action?: string;
  challenge_ts?: string;
  hostname?: string;
};

type TurnstileVerificationResult =
  | { success: true; hostname?: string; action?: string }
  | { success: false; errorCode: string; details?: string[] };

function isLocalBypassEnabled(env: Env) {
  return env.APP_ENV !== "production" && env.TURNSTILE_DISABLED === "true";
}

export async function verifyTurnstileToken(
  env: Env,
  token: string,
  remoteIp?: string
): Promise<TurnstileVerificationResult> {
  if (isLocalBypassEnabled(env)) {
    return { success: true, action: env.TURNSTILE_EXPECTED_ACTION ?? DEFAULT_EXPECTED_ACTION };
  }

  if (!env.TURNSTILE_SECRET_KEY) {
    return { success: false, errorCode: "CAPTCHA_NOT_CONFIGURED" };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), SITEVERIFY_TIMEOUT_MS);

  try {
    const body = new URLSearchParams({
      secret: env.TURNSTILE_SECRET_KEY,
      response: token
    });

    if (remoteIp) {
      body.set("remoteip", remoteIp);
    }

    const response = await fetch(TURNSTILE_SITEVERIFY_URL, {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded"
      },
      body,
      signal: controller.signal
    });

    if (!response.ok) {
      return { success: false, errorCode: "CAPTCHA_PROVIDER_ERROR", details: [String(response.status)] };
    }

    const payload = (await response.json()) as TurnstileSiteverifyResponse;

    if (!payload.success) {
      return {
        success: false,
        errorCode: "CAPTCHA_FAILED",
        details: payload["error-codes"] ?? ["verification_failed"]
      };
    }

    if (env.TURNSTILE_EXPECTED_HOSTNAME && payload.hostname !== env.TURNSTILE_EXPECTED_HOSTNAME) {
      return {
        success: false,
        errorCode: "CAPTCHA_HOSTNAME_MISMATCH",
        details: [payload.hostname ?? "missing_hostname"]
      };
    }

    const expectedAction = env.TURNSTILE_EXPECTED_ACTION ?? DEFAULT_EXPECTED_ACTION;

    if (payload.action !== expectedAction) {
      return {
        success: false,
        errorCode: "CAPTCHA_ACTION_MISMATCH",
        details: [payload.action ?? "missing_action"]
      };
    }

    return { success: true, hostname: payload.hostname, action: payload.action };
  } catch (error) {
    const errorCode = error instanceof DOMException && error.name === "AbortError"
      ? "CAPTCHA_TIMEOUT"
      : "CAPTCHA_PROVIDER_ERROR";

    return { success: false, errorCode };
  } finally {
    clearTimeout(timeoutId);
  }
}
