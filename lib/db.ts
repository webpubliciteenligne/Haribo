import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

/**
 * Backup des leads en base — filet de sécurité si le webhook (Make/Zapier) tombe.
 * Totalement optionnel : si aucune connection string n'est configurée (ex. démarrage
 * du projet avant provisioning d'une base), toutes les fonctions sont des no-op silencieux.
 *
 * Utilise @neondatabase/serverless (driver recommandé par Vercel depuis la dépréciation
 * de @vercel/postgres — le store "Vercel Postgres" est maintenant backé par Neon).
 *
 * Note : la création de table via IF NOT EXISTS à chaque appel est une simplification
 * volontaire pour le MVP (pas d'outillage de migration séparé). À faire évoluer vers
 * une vraie migration si le schéma grossit.
 */

function getConnectionString(): string | undefined {
  // Vercel expose plusieurs noms selon l'intégration (Postgres natif Vercel vs Neon direct).
  return process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
}

export function isDbConfigured(): boolean {
  return Boolean(getConnectionString());
}

let schemaEnsured = false;

async function ensureSchema(sql: NeonQueryFunction<false, false>): Promise<void> {
  if (schemaEnsured) return;
  await sql`
    CREATE TABLE IF NOT EXISTS leads (
      id SERIAL PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      source TEXT,
      fbc TEXT,
      fbp TEXT,
      ttclid TEXT,
      ip TEXT,
      user_agent TEXT,
      ads_consent BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;
  schemaEnsured = true;
}

export interface LeadBackupInput {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  source?: string;
  fbc?: string | null;
  fbp?: string | null;
  ttclid?: string | null;
  ip: string;
  userAgent: string;
  adsConsent: boolean;
}

/** Best-effort : ne lève jamais, un souci DB ne doit pas faire perdre le lead côté webhook. */
export async function backupLead(input: LeadBackupInput): Promise<void> {
  const connectionString = getConnectionString();
  if (!connectionString) return;

  try {
    const sql = neon(connectionString);
    await ensureSchema(sql);
    await sql`
      INSERT INTO leads (first_name, last_name, email, message, source, fbc, fbp, ttclid, ip, user_agent, ads_consent)
      VALUES (
        ${input.firstName},
        ${input.lastName},
        ${input.email},
        ${input.message},
        ${input.source ?? null},
        ${input.fbc ?? null},
        ${input.fbp ?? null},
        ${input.ttclid ?? null},
        ${input.ip},
        ${input.userAgent},
        ${input.adsConsent}
      )
    `;
  } catch (err) {
    console.error("[db] Échec du backup du lead :", err);
  }
}
