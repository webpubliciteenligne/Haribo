/**
 * Contenu éditable de l'offre — centralisé ici pour être ajusté en 30 secondes.
 *
 * Décision actée avec le client (12/09) : la page ne doit PAS afficher le texte
 * complet de l'offre (944 mots) — trop long pour du trafic froid Meta/TikTok, ça
 * nuit à la conversion. Le rôle de la page est d'accrocher et de pousser au
 * formulaire ; les détails complets sont donnés ensuite par email/conversation
 * directe une fois le lead récupéré.
 *
 * Structure retenue :
 * - `title` : intitulé officiel de l'offre transmis par le client, VERBATIM,
 *   c'est l'unique titre affiché (pas d'eyebrow, pas d'accroche séparée).
 * - `body` : quelques phrases courtes, orientées conversion, pas le texte complet.
 */
export const offerContent = {
  // Intitulé officiel transmis par le client le 12/09 — verbatim, ne pas reformuler.
  title: "Préparateur / Préparatrice de pochettes surprises à domicile (H/F) – Complément de revenu stable",
  // Texte transmis le 14/09 — verbatim.
  body: [
    "HARIBO recrute des Préparateurs / Préparatrices de pochettes surprises à domicile (H/F).",
    "Vous recherchez un complément de revenu avec une activité salariée à temps partiel ?",
    "Aucune expérience n'est requise : formation et accompagnement sont prévus à la prise de poste.",
    "Mission simple et organisée : préparation, assemblage et conditionnement de pochettes surprises.",
  ],
  images: [
    {
      src: "/images/offre-coffret-haribo.png",
      alt: "Coffret de bonbons",
    },
    {
      src: "/images/offre-pack-coloriage.png",
      alt: "Pack coloriage et bonbons",
    },
  ],
  formTitle: "Intéressé(e) ? Remplissez le formulaire ci-dessous pour confirmer votre disponibilité.",
  messagePlaceholder: "Intéressé(e) ? Écrivez-nous.",
  legalMention: "Mention légale à compléter (raison sociale, contact) dès réception des informations du client.",
};
