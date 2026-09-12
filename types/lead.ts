/**
 * Types partagés client/serveur pour le pipeline de leads.
 */

export interface LeadPayload {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  /** Champ honeypot anti-bot, doit rester vide côté humain. */
  company?: string;
  /** Cookie _fbc (Meta) capturé côté client pour le matching CAPI-ready. */
  fbc?: string;
  /** Cookie _fbp (Meta) capturé côté client. */
  fbp?: string;
  /** Click ID TikTok (paramètre ttclid ou cookie). */
  ttclid?: string;
  /** Page / campagne d'origine, utile pour le CRM. */
  source?: string;
}

export interface LeadApiSuccessResponse {
  success: true;
}

export interface LeadApiErrorResponse {
  success: false;
  error: string;
  issues?: Partial<Record<keyof LeadPayload, string[]>>;
}

export type LeadApiResponse = LeadApiSuccessResponse | LeadApiErrorResponse;
