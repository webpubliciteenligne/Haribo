/**
 * Consentement cookies publicitaires (Meta/TikTok) — minimal mais conforme.
 * Persisté en cookie 1st party (pas un traceur : c'est le stockage du choix lui-même).
 */

export type ConsentStatus = "unknown" | "granted" | "denied";

const CONSENT_COOKIE_NAME = "consent_ads";
const CONSENT_MAX_AGE_DAYS = 180;

export function readConsentCookie(): ConsentStatus {
  if (typeof document === "undefined") return "unknown";
  const match = document.cookie.match(/(?:^|; )consent_ads=([^;]*)/);
  const value = match?.[1];
  if (value === "granted" || value === "denied") return value;
  return "unknown";
}

export function writeConsentCookie(status: "granted" | "denied"): void {
  if (typeof document === "undefined") return;
  const maxAge = CONSENT_MAX_AGE_DAYS * 24 * 60 * 60;
  document.cookie = `${CONSENT_COOKIE_NAME}=${status}; path=/; max-age=${maxAge}; SameSite=Lax`;
}
