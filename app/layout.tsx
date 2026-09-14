import { ConsentProvider } from "@/components/consent/ConsentProvider";
import { CookieBanner } from "@/components/consent/CookieBanner";
import { MetaPixel } from "@/components/tracking/MetaPixel";
import { TikTokPixel } from "@/components/tracking/TikTokPixel";
import { offerContent } from "@/lib/content";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// next/font : auto-hébergement, zéro requête externe vers Google Fonts au runtime,
// zéro layout shift (font-display swap géré nativement). Critique pour le score Lighthouse mobile.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// Page discrète : trafic payant uniquement (Meta/TikTok). Pas d'indexation search,
// pas de carte de partage Open Graph — l'URL n'apparaît pas dans Google/Bing.
export const metadata: Metadata = {
  title: offerContent.title,
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      nosnippet: true,
      noarchive: true,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#FBF6EE",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className="min-h-screen bg-brand-bg font-sans text-brand antialiased">
        <ConsentProvider>
          {children}
          <CookieBanner />
          <MetaPixel />
          <TikTokPixel />
        </ConsentProvider>
      </body>
    </html>
  );
}
