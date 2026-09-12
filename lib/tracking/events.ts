/**
 * Wrappers défensifs autour de fbq (Meta) et ttq (TikTok).
 * Toujours vérifier l'existence de window.* avant d'appeler : le pixel peut ne pas
 * être encore chargé (Script "afterInteractive") ou être bloqué par un ad-blocker.
 */

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    ttq?: {
      track: (event: string, params?: Record<string, unknown>, options?: { event_id?: string }) => void;
      page?: () => void;
    };
  }
}

export function trackMetaEvent(event: string, params?: Record<string, unknown>, eventId?: string): void {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  try {
    // eventID est le 4e argument (camelCase côté pixel) — doit matcher le event_id
    // envoyé côté serveur (CAPI) en snake_case pour la déduplication Meta.
    window.fbq("track", event, params ?? {}, eventId ? { eventID: eventId } : undefined);
  } catch {
    // silencieux : le tracking ne doit jamais casser l'UX
  }
}

export function trackTikTokEvent(event: string, params?: Record<string, unknown>, eventId?: string): void {
  if (typeof window === "undefined" || !window.ttq) return;
  try {
    // event_id (3e argument, objet options) — doit matcher le event_id envoyé
    // côté serveur (Events API) pour la déduplication TikTok.
    window.ttq.track(event, params ?? {}, eventId ? { event_id: eventId } : undefined);
  } catch {
    // silencieux : le tracking ne doit jamais casser l'UX
  }
}

/** Déclenche l'event "Lead" sur les deux plateformes après succès du formulaire. */
export function trackLeadConversion(eventId: string, params?: Record<string, unknown>): void {
  trackMetaEvent("Lead", params, eventId);
  trackTikTokEvent("SubmitForm", params, eventId); // TikTok recommande "SubmitForm" ou "CompleteRegistration" selon le compte Ads
}

/**
 * Lit un cookie par son nom (utilisé pour récupérer _fbc / _fbp posés par le pixel Meta).
 */
export function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  const value = match?.[1];
  return value ? decodeURIComponent(value) : undefined;
}

/** Récupère le ttclid depuis l'URL (paramètre de clic TikTok Ads) s'il est présent. */
export function getTtclidFromUrl(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return new URLSearchParams(window.location.search).get("ttclid") ?? undefined;
}
