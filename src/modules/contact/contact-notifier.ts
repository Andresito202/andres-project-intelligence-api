import type { Env } from "../../types";
import type { CreateContactMessageInput } from "./contact.schema";

const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";

type Web3FormsResponse = {
  success?: boolean;
  message?: string;
};

export type ContactNotificationResult =
  | { status: "sent"; provider: "web3forms" }
  | { status: "skipped"; reason: "not_configured" }
  | { status: "failed"; provider: "web3forms"; reason: string };

export async function notifyContactMessage(
  env: Env,
  input: CreateContactMessageInput,
  messageId: string
): Promise<ContactNotificationResult> {
  if (!env.WEB3FORMS_ACCESS_KEY) {
    return { status: "skipped", reason: "not_configured" };
  }

  try {
    const response = await fetch(WEB3FORMS_ENDPOINT, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json"
      },
      body: JSON.stringify({
        access_key: env.WEB3FORMS_ACCESS_KEY,
        subject: env.CONTACT_NOTIFICATION_SUBJECT ?? "Nueva solicitud desde andrescamacho.dev",
        from_name: "andrescamacho.dev",
        replyto: input.email,
        name: input.name,
        email: input.email,
        message: input.message,
        source: input.source,
        message_id: messageId
      })
    });

    const payload = (await response.json().catch(() => ({}))) as Web3FormsResponse;

    if (!response.ok || payload.success !== true) {
      return {
        status: "failed",
        provider: "web3forms",
        reason: payload.message ?? `web3forms_http_${response.status}`
      };
    }

    return { status: "sent", provider: "web3forms" };
  } catch (error) {
    return {
      status: "failed",
      provider: "web3forms",
      reason: error instanceof Error ? error.message : "unknown_error"
    };
  }
}
