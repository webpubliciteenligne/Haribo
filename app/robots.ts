import type { MetadataRoute } from "next";

/**
 * Interdit l'indexation par les moteurs de recherche.
 * La page n'est destinée qu'au trafic payant (lien dans la pub Meta/TikTok).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  };
}
