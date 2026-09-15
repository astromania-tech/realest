/**
 * Deterministic helpers for clone-and-run.
 * Keep this file side-effect free so gate tests can import it.
 */

export const MIN_NODE_MAJOR = 20;

export const REQUIRED_ENV_KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
];

export const RECOMMENDED_ENV_KEYS = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "DATABASE_URL",
];

export const LOCAL_DEV_DEFAULTS = {
  NEXT_PUBLIC_APP_MODE: "development",
  NEXT_PUBLIC_APP_URL: "http://localhost:3000",
  NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
};

const PLACEHOLDER_TESTS = [
  (value) => value.length === 0,
  (value) => /\.\.\.$/.test(value),
  (value) => /your[_-]/i.test(value),
  (value) => /replace[_-]?me/i.test(value),
  (value) => /^changeme$/i.test(value),
  (value) => /example\.supabase\.co/i.test(value),
  (value) => /^re_your_/i.test(value),
  (value) => /\[YOUR-PASSWORD\]/i.test(value),
];

export function parseEnvFile(text) {
  const out = {};
  if (typeof text !== "string" || text.length === 0) return out;

  for (const rawLine of text.split(/\r?\n/)) {
    const trimmed = rawLine.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const line = trimmed.startsWith("export ")
      ? trimmed.slice("export ".length).trim()
      : trimmed;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;

    const key = line.slice(0, eq).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue;

    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }

  return out;
}

export function isPlaceholder(value) {
  if (value == null) return true;
  const normalized = String(value).trim();
  return PLACEHOLDER_TESTS.some((test) => test(normalized));
}

export function readEnvValue(env, key) {
  const value = env[key];
  if (value == null) return null;
  const normalized = String(value).trim();
  if (isPlaceholder(normalized)) return null;
  return normalized;
}

export function collectEnvIssues(env) {
  const missingRequired = REQUIRED_ENV_KEYS.filter(
    (key) => !readEnvValue(env, key),
  );
  const missingRecommended = RECOMMENDED_ENV_KEYS.filter(
    (key) => !readEnvValue(env, key),
  );
  return { missingRequired, missingRecommended };
}

export function parseNodeVersion(versionText) {
  const match = String(versionText ?? "").match(/v?(\d+)\.(\d+)\.(\d+)/);
  if (!match) return null;
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
}

export function meetsNodeRequirement(versionText, minMajor = MIN_NODE_MAJOR) {
  const parsed = parseNodeVersion(versionText);
  return Boolean(parsed && parsed.major >= minMajor);
}

export function mergeEnvSources(...sources) {
  const merged = {};
  for (const source of sources) {
    if (!source) continue;
    for (const [key, value] of Object.entries(source)) {
      if (value == null) continue;
      merged[key] = String(value);
    }
  }
  return merged;
}

export function mapSupabaseStatusEnv(statusEnv) {
  const apiUrl =
    readEnvValue(statusEnv, "API_URL") ||
    readEnvValue(statusEnv, "SUPABASE_URL") ||
    readEnvValue(statusEnv, "NEXT_PUBLIC_SUPABASE_URL");
  const anonKey =
    readEnvValue(statusEnv, "ANON_KEY") ||
    readEnvValue(statusEnv, "NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const serviceRoleKey =
    readEnvValue(statusEnv, "SERVICE_ROLE_KEY") ||
    readEnvValue(statusEnv, "SUPABASE_SERVICE_ROLE_KEY");
  const databaseUrl =
    readEnvValue(statusEnv, "DB_URL") ||
    readEnvValue(statusEnv, "DATABASE_URL");

  const mapped = {
    ...LOCAL_DEV_DEFAULTS,
  };

  if (apiUrl) mapped.NEXT_PUBLIC_SUPABASE_URL = apiUrl;
  if (anonKey) mapped.NEXT_PUBLIC_SUPABASE_ANON_KEY = anonKey;
  if (serviceRoleKey) mapped.SUPABASE_SERVICE_ROLE_KEY = serviceRoleKey;
  if (databaseUrl) {
    mapped.DATABASE_URL = databaseUrl;
    mapped.DIRECT_URL = databaseUrl;
  }

  return mapped;
}

export function serializeEnvFile(env, headerLines = []) {
  const lines = [...headerLines];
  if (headerLines.length > 0) lines.push("");

  const keys = Object.keys(env).sort();
  for (const key of keys) {
    const value = env[key];
    if (value == null) continue;
    lines.push(`${key}=${escapeEnvValue(String(value))}`);
  }
  lines.push("");
  return lines.join("\n");
}

export function escapeEnvValue(value) {
  if (/[\s#"'$`]/.test(value)) {
    return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  }
  return value;
}

export function missingKeysMessage(missingRequired) {
  return [
    "Cannot start the app: required environment values are missing.",
    "",
    `Missing: ${missingRequired.join(", ")}`,
    "",
    "Do one of the following:",
    "  1. Copy .env.example to .env.local and paste your Supabase project keys",
    "     from Project Settings > API.",
    "  2. Re-run with --local-supabase if Docker is installed (starts a local stack).",
    "",
    "Then run: ./start.sh",
  ].join("\n");
}

export function pickListenPort(preferredPort, usedPorts) {
  const start = Number(preferredPort) || 3000;
  const occupied = new Set((usedPorts ?? []).map((port) => Number(port)));
  for (let port = start; port < start + 20; port += 1) {
    if (!occupied.has(port)) return port;
  }
  throw new Error(`No free port found from ${start} to ${start + 19}`);
}

export function parseListenerPid(ssOrLsofOutput, port) {
  const text = String(ssOrLsofOutput ?? "");
  const portToken = `:${Number(port)}`;
  for (const line of text.split(/\r?\n/)) {
    if (!line.includes(portToken) && !/^\s*\d+\s*$/.test(line)) continue;
    const pidMatch = line.match(/pid=(\d+)/) || line.match(/^\s*(\d+)\s*$/);
    if (pidMatch) return Number(pidMatch[1]);
  }
  return null;
}

export function sameRepoPath(left, right) {
  if (!left || !right) return false;
  const normalize = (value) => String(value).replace(/\\/g, "/").replace(/\/+$/, "");
  return normalize(left) === normalize(right);
}

export function looksLikeRealestHtml(html) {
  if (typeof html !== "string" || html.length === 0) return false;
  const hasBrand = html.includes("RealEST");
  const hasAsset =
    html.includes("realest-logo") ||
    html.includes("Find Your Next Move") ||
    html.includes("realest.ng");
  return hasBrand && hasAsset;
}

export function decidePortAction({
  preferredPort,
  repoRoot,
  occupantCwd = null,
  usedPorts = [],
} = {}) {
  const preferred = Number(preferredPort) || 3000;
  const occupied = usedPorts.map((port) => Number(port));
  const preferredBusy = occupied.includes(preferred);

  if (!preferredBusy) {
    return { action: "listen", port: preferred, reason: "free" };
  }

  if (sameRepoPath(occupantCwd, repoRoot)) {
    return { action: "reuse", port: preferred, reason: "same-repo" };
  }

  return {
    action: "listen",
    port: pickListenPort(preferred + 1, occupied),
    reason: occupantCwd ? "other-repo" : "occupied-unknown",
  };
}

export async function waitForHttp(url, options = {}) {
  const timeoutMs = options.timeoutMs ?? 120_000;
  const intervalMs = options.intervalMs ?? 500;
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;
  const isReady =
    options.isReady ?? ((response) => response.status > 0 && response.status < 600);

  if (typeof fetchImpl !== "function") {
    throw new Error("fetch is not available");
  }

  const started = Date.now();
  let lastError = null;

  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetchImpl(url, {
        redirect: "manual",
        cache: "no-store",
      });
      if (await isReady(response)) {
        return {
          ok: true,
          status: response.status,
          url,
          elapsedMs: Date.now() - started,
        };
      }
      lastError = new Error(`Unexpected status ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await sleep(intervalMs);
  }

  const detail = lastError instanceof Error ? lastError.message : String(lastError);
  throw new Error(`Timed out waiting for ${url} (${timeoutMs}ms). Last error: ${detail}`);
}

export function startAppReadyLine(url) {
  return `START_APP_READY url=${url}`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
