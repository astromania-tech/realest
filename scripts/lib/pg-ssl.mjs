/**
 * Prisma/pg SSL: local Docker Postgres has no TLS. Hosted Supabase does.
 * Same-input-same-output. Do not decide this in a model reply.
 *
 * node-pg Object.assign(config, parse(url)) can drop ssl:false. Put sslmode
 * on the URL so local Docker never starts a TLS handshake.
 */

function isLocalDockerUrl(lower) {
  return (
    /@(localhost|127\.0\.0\.1|\[::1\])[:/]/.test(lower) ||
    lower.includes("@localhost:") ||
    lower.includes("@127.0.0.1:") ||
    /:54322(\/|\?|$)/.test(lower)
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
  if (
    lower.includes("supabase.co") ||
    lower.includes("sslmode=require") ||
    lower.includes("sslmode=verify")
  ) {
    return { rejectUnauthorized: false };
  }
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
