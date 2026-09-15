import { LeadForm } from "@/components/forms/LeadForm";
import { offerContent } from "@/lib/content";
import Image from "next/image";

/**
 * Page unique, volontairement minimaliste (décision actée avec le client) :
 * titre (l'objet) + corps (l'offre) + visuels + petit formulaire. Pas de landing
 * page à sections multiples (Hero/Preuve sociale/FAQ).
 *
 * ⚠️ Le texte de l'offre est un PLACEHOLDER (cf. lib/content.ts) en attente du
 * texte définitif transmis par le client par email.
 */
export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-8 px-5 pb-16 pt-14 sm:pt-20">
      <header className="text-center">
        <h1 className="text-2xl font-bold leading-tight sm:text-3xl">{offerContent.title}</h1>
      </header>

      <div className="grid grid-cols-2 gap-3">
        {offerContent.images.map((image, index) => (
          <div key={image.src} className="relative aspect-square overflow-hidden rounded-xl border border-black/10">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(max-width: 640px) 50vw, 320px"
              className="object-cover"
              priority={index === 0}
            />
          </div>
        ))}
      </div>

      <section className="space-y-4 text-base leading-relaxed text-brand/90">
        {offerContent.body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </section>

      <section
        id="contact"
        className="rounded-xl border border-black/10 bg-white p-6 shadow-sm sm:p-8"
      >
        <h2 className="mb-6 text-xl font-semibold">{offerContent.formTitle}</h2>
        <LeadForm />
      </section>

      <footer className="text-center text-xs text-brand-muted">
        <p>
          © {new Date().getFullYear()} — {offerContent.legalMention}
        </p>
      </footer>
    </main>
  );
}
