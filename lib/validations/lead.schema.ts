import { z } from "zod";

/**
 * Schéma unique, partagé entre le formulaire client (react-hook-form)
 * et la route API (/api/leads). Une seule source de vérité pour la validation.
 */
export const leadSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "Le prénom doit contenir au moins 2 caractères.")
    .max(50, "Le prénom est trop long.")
    .regex(/^[a-zA-ZÀ-ÖØ-öø-ÿ' -]+$/, "Le prénom contient des caractères invalides."),

  lastName: z
    .string()
    .trim()
    .min(2, "Le nom doit contenir au moins 2 caractères.")
    .max(50, "Le nom est trop long.")
    .regex(/^[a-zA-ZÀ-ÖØ-öø-ÿ' -]+$/, "Le nom contient des caractères invalides."),

  email: z
    .string()
    .trim()
    .min(5, "Email requis.")
    .max(100, "Email trop long.")
    .email("Format d'email invalide."),

  message: z
    .string()
    .trim()
    .min(10, "Merci de détailler votre demande (10 caractères minimum).")
    .max(1000, "Message trop long (1000 caractères maximum)."),

  // Honeypot : champ invisible pour l'utilisateur, doit rester vide.
  // Volontairement PAS de contrainte de validation ici (pas de max(0)) : si un bot le
  // remplit, on veut que la requête passe la validation Zod pour pouvoir la neutraliser
  // silencieusement dans la route (réponse 200 sans rien transmettre), au lieu de
  // révéler l'existence du honeypot via une erreur 422 explicite.
  company: z.string().max(200).optional().or(z.literal("")),

  // Consentement RGPD léger, spécifique au traitement des données du formulaire
  // (distinct du consentement cookies/pixels géré par le bandeau global).
  dataConsent: z.boolean().refine((v) => v === true, {
    message: "Merci d'accepter avant d'envoyer votre demande.",
  }),

  // Métadonnées de tracking, non affichées, injectées par le formulaire.
  fbc: z.string().max(200).optional(),
  fbp: z.string().max(200).optional(),
  ttclid: z.string().max(200).optional(),
  source: z.string().max(100).optional(),
  // Identifiant unique généré côté client, réutilisé pour le server-side event
  // (Meta CAPI / TikTok Events API) afin de dédupliquer avec l'event pixel.
  eventId: z.string().max(100).optional(),
  // Reflet du choix fait sur le bandeau cookie : n'envoyer les events serveur
  // (CAPI/Events API) que si l'utilisateur a explicitement accepté.
  adsConsent: z.boolean().optional().default(false),
});

export type LeadFormValues = z.infer<typeof leadSchema>;

/** Sous-ensemble des champs réellement affichés/saisis dans le formulaire. */
export const leadFormFields = ["firstName", "lastName", "email", "message"] as const;
