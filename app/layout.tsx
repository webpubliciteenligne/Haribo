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

// Titre synchronisé avec lib/content.ts (source unique).
export const metadata: Metadata = {
  title: offerContent.title,
  description: offerContent.title,
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    title: offerContent.title,
    description: offerContent.title,
    // images: ["/images/og-cover.webp"], // TODO : fournir le visuel de partage
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
