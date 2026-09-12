import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Palette provisoire : fond clair épuré (cf. référence visuelle validée) + accent rouge
        // qui fait echo à l'identite Haribo, sans tomber dans le "bonbon" enfantin.
        // TODO: à ajuster si le businessman fournit une charte graphique dédiée à l'offre.
        brand: {
          DEFAULT: "#1A1614", // texte principal, quasi-noir chaud
          bg: "#FBF6EE", // fond crème, lecture confortable, look "premium épuré"
          accent: "#D2001F", // rouge (clin d'oeil Haribo), utilisé avec parcimonie (CTA uniquement)
          muted: "#7A716A", // texte secondaire
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
