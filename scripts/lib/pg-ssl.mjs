/**
 * Prisma/pg SSL: local Docker Postgres has no TLS. Hosted Supabase does.
 * Same-input-same-output. Do not decide this in a model reply.
 *
 * node-pg Object.assign(config, parse(url)) can drop the ssl object. Pin
 * sslmode on the URL so the handshake cannot silently change.
 *
 * Production last worked (pre-24e6451 / 4d9cc35) with
 * ssl: { rejectUnauthorized: false }. Forcing sslmode=verify-full on Vercel
 * failed with P1011 "self-signed certificate in certificate chain"
 * (realest.ng waitlist POST 2026-09-25). Do not require a Vercel env change.
 *
 * Hosted: encrypt (sslmode=require), do not verify the CA/hostname.
 * Local: sslmode=disable.
 */

const HOSTED_TLS = { rejectUnauthorized: false };

function isLocalDockerUrl(lower) {
  return (
    /@(localhost|127\.0\.0\.1|\[::1\])[:/]/.test(lower) ||
    lower.includes("@localhost:") ||
    lower.includes("@127.0.0.1:") ||
    /:54322(\/|\?|$)/.test(lower)
  );
}

function isHostedPostgresUrl(lower) {
  return (
    lower.includes("supabase.co") ||
    lower.includes("pooler.supabase.com") ||
    lower.includes("sslmode=require") ||
    lower.includes("sslmode=verify")
  );
}

function withSslMode(connectionString, mode) {
  if (!connectionString) return connectionString;
  if (/[?&]sslmode=/i.test(connectionString)) {
    return connectionString.replace(/([?&]sslmode=)[^&]*/i, `$1${mode}`);
  }
  const sep = connectionString.includes("?") ? "&" : "?";
  return `${connectionString}${sep}sslmode=${mode}`;
}

export function pgAdapterSsl(connectionString) {
  if (!connectionString) return false;
  const lower = String(connectionString).toLowerCase();
  if (lower.includes("sslmode=disable") || isLocalDockerUrl(lower)) return false;
  if (isHostedPostgresUrl(lower)) return HOSTED_TLS;
  return false;
}

/** Config object for `new PrismaPg(...)`. Local URLs get sslmode=disable. */
export function pgAdapterConfig(connectionString) {
  const ssl = pgAdapterSsl(connectionString);
  if (!connectionString) return { connectionString, ssl: false };
  if (ssl === false) {
    return { connectionString: withSslMode(connectionString, "disable"), ssl: false };
  }
  return { connectionString: withSslMode(connectionString, "require"), ssl };
}
