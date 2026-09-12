import { backupLead } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendMetaLeadEvent } from "@/lib/tracking/capi";
import { sendTikTokLeadEvent } from "@/lib/tracking/tiktok-events";
import { leadSchema } from "@/lib/validations/lead.schema";
import type { LeadApiResponse } from "@/types/lead";
import { NextRequest, NextResponse } from "next/server";

// Node runtime requis pour AbortSignal.timeout + crypto (hash SHA-256) + logs serveur exploitables.
export const runtime = "nodejs";
// Jamais de cache sur une route de soumission de formulaire.
export const dynamic = "force-dynamic";

function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  return req.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(req: NextRequest): Promise<NextResponse<LeadApiResponse>> {
  try {
    // 1. Rate limiting par IP — bloque le double-submit et le spam basique.
    const ip = getClientIp(req);
    const { allowed, retryAfterSeconds } = checkRateLimit(ip);
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: "Trop de tentatives. Merci de réessayer dans quelques instants." },
        { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
      );
    }

    // 2. Parsing défensif du body.
    const rawBody = await req.json().catch(() => null);
    if (!rawBody || typeof rawBody !== "object") {
      return NextResponse.json({ success: false, error: "Requête invalide." }, { status: 400 });
    }

    // 3. Validation stricte serveur (même schéma que le client, ne jamais faire confiance au front).
    const parsed = leadSchema.safeParse(rawBody);
    if (!parsed.success) {
      const issues = parsed.error.flatten().fieldErrors;
      return NextResponse.json(
        { success: false, error: "Validation échouée.", issues },
        { status: 422 }
      );
    }

    const data = parsed.data;

    // 4. Honeypot : si rempli, c'est un bot. On répond succès (pour ne pas lui apprendre à l'éviter)
    // mais on n'envoie RIEN nulle part (ni webhook, ni CAPI, ni DB).
    if (data.company && data.company.trim().length > 0) {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // 5. Vérification de la config avant tout traitement.
    const webhookUrl = process.env.LEADS_WEBHOOK_URL;
    if (!webhookUrl) {
      console.error("[/api/leads] Variable d'env LEADS_WEBHOOK_URL manquante.");
      return NextResponse.json(
        { success: false, error: "Configuration serveur invalide." },
        { status: 500 }
      );
    }

    const userAgent = req.headers.get("user-agent") ?? "unknown";
    const sourceUrl = req.headers.get("referer") ?? undefined;
    const eventId = data.eventId ?? crypto.randomUUID();

    // 6. Construction du payload final (métadonnées serveur + données validées).
    const webhookPayload = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      message: data.message,
      source: data.source ?? "landing-page",
      fbc: data.fbc ?? null,
      fbp: data.fbp ?? null,
      ttclid: data.ttclid ?? null,
      ip,
      userAgent,
      receivedAt: new Date().toISOString(),
    };

    // 7. Envoi vers le webhook (canal principal, doit réussir pour que la requête soit un succès),
    // en parallèle des canaux best-effort (CAPI, TikTok Events API, backup DB) qui ne bloquent
    // jamais la réponse utilisateur.
    const webhookPromise = fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(webhookPayload),
      signal: AbortSignal.timeout(8000),
    }).catch((err: unknown) => {
      console.error("[/api/leads] Échec réseau vers le webhook :", err);
      return null;
    });

    const backupPromise = backupLead({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      message: data.message,
      source: data.source,
      fbc: data.fbc,
      fbp: data.fbp,
      ttclid: data.ttclid,
      ip,
      userAgent,
      adsConsent: data.adsConsent,
    });

    // CAPI/Events API : uniquement si l'utilisateur a explicitement consenti au tracking
    // publicitaire (le bandeau cookie). Un event serveur envoyé sans consentement serait
    // hors-cadre RGPD au même titre que le pixel navigateur.
    const trackingPromises = data.adsConsent
      ? [
        sendMetaLeadEvent({
          eventId,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          fbp: data.fbp,
          fbc: data.fbc,
          clientIp: ip,
          userAgent,
          sourceUrl,
        }),
        sendTikTokLeadEvent({
          eventId,
          email: data.email,
          ttclid: data.ttclid,
          clientIp: ip,
          userAgent,
          sourceUrl,
        }),
      ]
      : [];

    const [webhookResponse] = await Promise.all([
      webhookPromise,
      backupPromise,
      ...trackingPromises,
    ]);

    if (!webhookResponse || !webhookResponse.ok) {
      console.error(
        `[/api/leads] Webhook KO — status: ${webhookResponse?.status ?? "network-error"}`
      );
      return NextResponse.json(
        { success: false, error: "Erreur lors de l'envoi du lead. Merci de réessayer." },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("[/api/leads] Erreur serveur inattendue :", err);
    return NextResponse.json(
      { success: false, error: "Erreur serveur. Merci de réessayer plus tard." },
      { status: 500 }
    );
  }
}

// On expose explicitement les autres verbes en 405 pour éviter tout comportement par défaut ambigu.
export async function GET(): Promise<NextResponse<LeadApiResponse>> {
  return NextResponse.json({ success: false, error: "Méthode non autorisée." }, { status: 405 });
}
