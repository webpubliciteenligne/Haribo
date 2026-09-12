/**
 * Rate limiting en mémoire (fenêtre glissante simplifiée).
 *
 * ⚠️ LIMITE CONNUE : sur Vercel, chaque instance serverless a sa propre mémoire.
 * Ce garde-fou suffit à filtrer le bruit basique (bots non distribués, double-submit),
 * mais n'est PAS un rate-limit distribué fiable à haute échelle.
 * Pour une garantie stricte en prod (recommandé si le budget Ads est significatif) :
 * remplacer par Upstash Redis (@upstash/ratelimit), compatible Vercel Edge, ~5 min d'intégration.
 */

interface Bucket {
  count: number;
  windowStart: number;
}

const WINDOW_MS = 60_000; // fenêtre de 1 minute
const MAX_REQUESTS_PER_WINDOW = 5; // 5 soumissions / IP / minute

const buckets = new Map<string, Bucket>();

// Nettoyage périodique pour éviter une fuite mémoire sur les instances long-lived.
const MAX_BUCKETS = 5000;

export function checkRateLimit(identifier: string): {
  allowed: boolean;
  retryAfterSeconds: number;
} {
  const now = Date.now();

  if (buckets.size > MAX_BUCKETS) {
    buckets.clear();
  }

  const bucket = buckets.get(identifier);

  if (!bucket || now - bucket.windowStart > WINDOW_MS) {
    buckets.set(identifier, { count: 1, windowStart: now });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (bucket.count >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfterSeconds = Math.ceil((WINDOW_MS - (now - bucket.windowStart)) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  bucket.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}
