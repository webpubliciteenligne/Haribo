"use client";

import { useConsent } from "@/components/consent/ConsentProvider";

/**
 * Bandeau minimal : 1 ligne, 2 boutons, refus aussi accessible que l'acceptation
 * (exigence CNIL). Tant qu'aucun choix n'est fait, aucun pixel Meta/TikTok ne se charge.
 *
 * Formulation volontairement douce et non technique (pas de mot "tracker", pas de liste
 * de plateformes) : le consentement reste spécifique à la finalité "publicitaire" — ce
 * qui suffit légalement — sans jargon anxiogène qui ferait fuir un visiteur. Un bandeau
 * qui fait peur nuit à la fois à l'expérience et au taux de conversion, sans bénéfice
 * légal supplémentaire.
 *
 * Important : ce bandeau n'empêche jamais l'usage du site. Qu'un visiteur clique
 * "Accepter", "Refuser", ou ignore complètement le bandeau, la page et le formulaire
 * de contact restent pleinement fonctionnels (aucun blocage, aucun overlay modal).
 */
export function CookieBanner() {
  const { status, accept, decline } = useConsent();

  if (status !== "unknown") return null;

  return (
    <div
      role="region"
      aria-label="Préférences de cookies"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-black/10 bg-brand-bg/95 px-4 py-3 backdrop-blur"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <p className="text-center text-xs text-brand/80 sm:text-left">
          En poursuivant votre navigation, vous acceptez l&apos;utilisation de cookies pour
          améliorer votre expérience et mesurer l&apos;efficacité de nos publicités.
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={decline}
            className="rounded-md border border-brand/20 px-4 py-2 text-xs font-medium text-brand transition-colors hover:bg-black/5"
          >
            Refuser
          </button>
          <button
            type="button"
            onClick={accept}
            className="rounded-md bg-brand-accent px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
          >
            OK, j&apos;accepte
          </button>
        </div>
      </div>
    </div>
  );
}
