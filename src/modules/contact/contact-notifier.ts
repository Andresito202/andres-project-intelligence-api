import type { Env } from "../../types";
import type { CreateContactMessageInput } from "./contact.schema";

const BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

type BrevoResponse = {
  messageId?: string;
  code?: string;
  message?: string;
};

export type ContactNotificationResult =
  | { status: "sent"; provider: "brevo"; messageId?: string }
  | { status: "skipped"; reason: "not_configured" | "missing_recipient" | "missing_sender" }
  | { status: "failed"; provider: "brevo"; reason: string };

export async function notifyContactMessage(
  env: Env,
  input: CreateContactMessageInput,
  messageId: string
): Promise<ContactNotificationResult> {
  if (!env.BREVO_API_KEY) {
    return { status: "skipped", reason: "not_configured" };
  }

  if (!env.CONTACT_TO_EMAIL) {
    return { status: "skipped", reason: "missing_recipient" };
  }

  if (!env.CONTACT_FROM_EMAIL) {
    return { status: "skipped", reason: "missing_sender" };
  }

  try {
    const response = await fetch(BREVO_ENDPOINT, {
      method: "POST",
      headers: {
        "api-key": env.BREVO_API_KEY,
        "content-type": "application/json",
        accept: "application/json"
      },
      body: JSON.stringify({
        sender: {
          name: env.CONTACT_FROM_NAME ?? "andrescamacho.dev",
          email: env.CONTACT_FROM_EMAIL
        },
        to: [{ email: env.CONTACT_TO_EMAIL, name: "Andres Camacho" }],
        replyTo: { email: input.email, name: input.name },
        subject: env.CONTACT_NOTIFICATION_SUBJECT ?? "Nueva solicitud profesional desde andrescamacho.dev",
        htmlContent: buildHtmlEmail(input, messageId),
        textContent: buildTextEmail(input, messageId)
      })
    });

    const payload = (await response.json().catch(() => ({}))) as BrevoResponse;

    if (!response.ok) {
      return {
        status: "failed",
        provider: "brevo",
        reason: payload.message ?? payload.code ?? `brevo_http_${response.status}`
      };
    }

    return { status: "sent", provider: "brevo", messageId: payload.messageId };
  } catch (error) {
    return {
      status: "failed",
      provider: "brevo",
      reason: error instanceof Error ? error.message : "unknown_error"
    };
  }
}

function buildTextEmail(input: CreateContactMessageInput, messageId: string): string {
  return [
    "Nueva solicitud profesional desde andrescamacho.dev",
    "",
    `Nombre: ${input.name}`,
    `Email: ${input.email}`,
    `Fuente: ${input.source}`,
    `Mensaje ID: ${messageId}`,
    "",
    "Mensaje:",
    input.message
  ].join("\n");
}

function buildHtmlEmail(input: CreateContactMessageInput, messageId: string): string {
  return `
    <h2>Nueva solicitud profesional desde andrescamacho.dev</h2>
    <p><strong>Nombre:</strong> ${escapeHtml(input.name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(input.email)}</p>
    <p><strong>Fuente:</strong> ${escapeHtml(input.source)}</p>
    <p><strong>Mensaje ID:</strong> ${escapeHtml(messageId)}</p>
    <hr>
    <p>${escapeHtml(input.message).replace(/\n/g, "<br>")}</p>
  `;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
