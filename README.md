# Haribo — Landing Page Lead Gen (Meta Ads / TikTok Ads — FR)

Page unique de lead gen, Next.js 15 (App Router) + TypeScript + Tailwind, pour trafic payant qualifié (Meta Ads / TikTok Ads), hébergée sur Vercel.

⚠️ **Le texte de l'offre affiché sur `/` est un placeholder** (cf. [`lib/content.ts`](lib/content.ts)), en attente du texte définitif transmis par le client.

## Stack

- **Next.js 15.5** (App Router)
- **TypeScript strict**
- **Tailwind CSS**
- **react-hook-form + zod** (validation identique client/serveur)
- **next/script** pour les pixels Meta & TikTok, chargés uniquement après consentement
- **Meta Conversions API + TikTok Events API** (server-side, dédupliqués avec le pixel via `event_id`)
- **@neondatabase/serverless** pour le backup optionnel des leads

## Démarrage

```bash
npm install
cp .env.local.example .env.local   # renseigner LEADS_WEBHOOK_URL, pixels, tokens CAPI/Events API
npm run dev
```

## Variables d'environnement (Vercel : Project Settings → Environment Variables)

| Variable | Description |
|---|---|
| `LEADS_WEBHOOK_URL` | Endpoint Make/Zapier qui reçoit le POST validé (→ Google Sheets/CRM) |
| `NEXT_PUBLIC_META_PIXEL_ID` | ID du Pixel Meta |
| `NEXT_PUBLIC_TIKTOK_PIXEL_ID` | ID/pixel code TikTok |
| `META_CAPI_ACCESS_TOKEN` | Token Conversions API (Meta Events Manager) |
| `TIKTOK_EVENTS_API_ACCESS_TOKEN` | Token Events API (TikTok Ads Manager) |
| `POSTGRES_URL` / `DATABASE_URL` | Optionnel — active le backup DB des leads si renseigné |

## Architecture

- [`app/page.tsx`](app/page.tsx) : page unique (titre + corps de l'offre + photos + formulaire).
- [`app/api/leads/route.ts`](app/api/leads/route.ts) : validation Zod, honeypot, rate-limit IP, webhook + backup DB + Meta CAPI + TikTok Events API en parallèle.
- [`components/forms/LeadForm.tsx`](components/forms/LeadForm.tsx) : formulaire Nom/Prénom/Email/Message + consentement RGPD léger.
- [`components/consent/`](components/consent) : bandeau cookie minimal + contexte de consentement, gate le chargement des pixels (conformité CNIL — pas de traceur avant consentement explicite).
- [`components/tracking/`](components/tracking) : pixels Meta/TikTok, ne se chargent que si consentement accordé.
- [`lib/tracking/capi.ts`](lib/tracking/capi.ts) / [`lib/tracking/tiktok-events.ts`](lib/tracking/tiktok-events.ts) : envoi server-side, dédupliqué via `event_id` partagé avec le pixel.
- [`lib/db.ts`](lib/db.ts) : backup optionnel des leads (no-op si `POSTGRES_URL`/`DATABASE_URL` absent).

## À faire avant mise en prod

- [ ] Remplacer le texte placeholder de l'offre (`lib/content.ts`) par le texte définitif du client.
- [ ] Renseigner les identifiants (webhook, pixels, tokens CAPI/Events API) dans Vercel.
- [ ] Compléter la mention légale (raison sociale/contact) dans le footer.
- [ ] Provisionner une base (Neon via Vercel Marketplace) si le backup DB est souhaité.
- [ ] Phase 2 : configuration Meta Ads Manager / TikTok Ads Manager (campagnes, ciblage France).
