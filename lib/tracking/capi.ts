import { createHash } from "crypto";

/**
 * Client Meta Conversions API (server-side).
 * Complète le pixel navigateur : le pixel seul rate 30-60% des conversions
 * (ad blockers, iOS ATT, Safari ITP). Meta recommande officiellement le dual tracking
 * (pixel + CAPI) avec déduplication via un event_id partagé.
 *
 * N'échoue jamais bruyamment : un problème de tracking ne doit jamais faire échouer
 * la capture du lead lui-même (le webhook/DB restent la source de vérité business).
 */

function sha256(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

const META_GRAPH_VERSION = "v21.0";

export interface MetaLeadEventInput {
  eventId: string;
  email: string;
  firstName: string;
  lastName: string;
  fbp?: string;
  fbc?: string;
  clientIp: string;
  userAgent: string;
  sourceUrl?: string;
}

export async function sendMetaLeadEvent(input: MetaLeadEventInput): Promise<void> {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;

  // CAPI non configuré : no-op silencieux, le lead n'est jamais bloqué pour ça.
  if (!pixelId || !accessToken) return;

  const payload = {
    data: [
      {
        event_name: "Lead",
        event_time: Math.floor(Date.now() / 1000),
        event_id: input.eventId,
        action_source: "website",
        event_source_url: input.sourceUrl,
        user_data: {
          em: [sha256(input.email)],
          fn: [sha256(input.firstName)],
          ln: [sha256(input.lastName)],
          client_ip_address: input.clientIp,
          client_user_agent: input.userAgent,
          ...(input.fbp ? { fbp: input.fbp } : {}),
          ...(input.fbc ? { fbc: input.fbc } : {}),
        },
      },
    ],
  };

  try {
    const res = await fetch(
      `https://graph.facebook.com/${META_GRAPH_VERSION}/${pixelId}/events?access_token=${accessToken}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(5000),
      }
    );
    if (!res.ok) {
      console.error(`[meta-capi] Réponse non-OK (${res.status}) :`, await res.text());
    }
  } catch (err) {
    console.error("[meta-capi] Échec de l'envoi :", err);
  }
}
