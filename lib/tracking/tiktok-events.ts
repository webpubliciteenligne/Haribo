import { createHash } from "crypto";

/**
 * Client TikTok Events API (server-side). Même logique que Meta CAPI :
 * complète le pixel navigateur, dédupliqué via event_id partagé.
 */

function sha256(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

const TIKTOK_EVENTS_API_URL = "https://business-api.tiktok.com/open_api/v1.3/event/track/";

export interface TikTokLeadEventInput {
  eventId: string;
  email: string;
  ttclid?: string;
  clientIp: string;
  userAgent: string;
  sourceUrl?: string;
}

export async function sendTikTokLeadEvent(input: TikTokLeadEventInput): Promise<void> {
  const pixelCode = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;
  const accessToken = process.env.TIKTOK_EVENTS_API_ACCESS_TOKEN;

  // Events API non configurée : no-op silencieux.
  if (!pixelCode || !accessToken) return;

  const payload = {
    event_source: "web",
    event_source_id: pixelCode,
    data: [
      {
        event: "SubmitForm",
        event_time: Math.floor(Date.now() / 1000),
        event_id: input.eventId,
        user: {
          email: sha256(input.email),
          ...(input.ttclid ? { ttclid: input.ttclid } : {}),
          ip: input.clientIp,
          user_agent: input.userAgent,
        },
        ...(input.sourceUrl ? { page: { url: input.sourceUrl } } : {}),
      },
    ],
  };

  try {
    const res = await fetch(TIKTOK_EVENTS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Token": accessToken,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      console.error(`[tiktok-events] Réponse non-OK (${res.status}) :`, await res.text());
    }
  } catch (err) {
    console.error("[tiktok-events] Échec de l'envoi :", err);
  }
}
