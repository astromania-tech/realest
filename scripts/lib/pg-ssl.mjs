/**
 * Prisma/pg SSL: local Docker Postgres has no TLS. Hosted Supabase does.
 * Same-input-same-output. Do not decide this in a model reply.
 *
 * Working production handshake (PR #42/#43 on main, e.g. d120b4c / 490a460):
 *
 *   new PrismaPg({
 *     connectionString: process.env.DATABASE_URL,
 *     ssl: { rejectUnauthorized: false },
 *   })
 *
 * Do not rewrite sslmode on hosted URLs. Current pg treats sslmode=require
 * as verify-full; pinning require/verify-full on the URL caused P1011 on
 * Vercel even when ssl.rejectUnauthorized was false (URL parse overrides).
 *
 * Local Docker needs sslmode=disable (no TLS). Hosted: leave the URL as
 * Vercel provides it; only set ssl: { rejectUnauthorized: false }.
 * No Vercel env change.
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
  // Host detection by hostname. Also treat libpq sslmode hints as hosted
  // (require / verify-ca / verify-full) so a non-supabase host with TLS
  // still gets rejectUnauthorized: false. Do not key off node-pg-only
  // sslmode=no-verify; we never emit that mode.
  return (
    lower.includes("supabase.co") ||
    lower.includes("pooler.supabase.com") ||
    /[?&]sslmode=(require|verify-ca|verify-full)(&|$)/.test(lower)
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

/** Strip sslmode so URL parse cannot override the explicit ssl object. */
function withoutSslMode(connectionString) {
  if (!connectionString) return connectionString;
  let url = connectionString.replace(/([?&])sslmode=[^&]*/gi, "$1");
  url = url.replace(/\?&/, "?").replace(/[?&]$/, "");
  url = url.replace(/\?&+/g, "?").replace(/&&+/g, "&");
  return url;
}

export function pgAdapterSsl(connectionString) {
  if (!connectionString) return false;
  const lower = String(connectionString).toLowerCase();
  if (lower.includes("sslmode=disable") || isLocalDockerUrl(lower)) return false;
  if (isHostedPostgresUrl(lower)) return HOSTED_TLS;
  return false;
}

/**
 * Config for `new PrismaPg(...)`.
 * Local: sslmode=disable, ssl false.
 * Hosted: DATABASE_URL as provided (no sslmode pin), ssl rejectUnauthorized false.
 */
export function pgAdapterConfig(connectionString) {
  const ssl = pgAdapterSsl(connectionString);
  if (!connectionString) return { connectionString, ssl: false };
  if (ssl === false) {
    return { connectionString: withSslMode(connectionString, "disable"), ssl: false };
  }
  // Match PR #43: do not rewrite hosted sslmode; pass ssl object only.
  return { connectionString: withoutSslMode(connectionString), ssl };
}
