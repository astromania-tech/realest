/**
 * Deterministic helpers for clone-and-run.
 * Keep this file side-effect free so gate tests can import it.
 */

export const MIN_NODE_MAJOR = 20;

export const REQUIRED_ENV_KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

export const RECOMMENDED_ENV_KEYS = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "DATABASE_URL",
] as const;

export const LOCAL_DEV_DEFAULTS: Record<string, string> = {
  NEXT_PUBLIC_APP_MODE: "development",
  NEXT_PUBLIC_APP_URL: "http://localhost:3000",
  NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
};

export type EnvMap = Record<string, string | undefined>;

export type NodeVersion = {
  major: number;
  minor: number;
  patch: number;
};

export type EnvIssues = {
  missingRequired: string[];
  missingRecommended: string[];
};

export type PortDecision = {
  action: "listen" | "reuse";
  port: number;
  reason: "free" | "same-repo" | "other-repo" | "occupied-unknown";
};

export type WaitForHttpOptions = {
  timeoutMs?: number;
  intervalMs?: number;
  fetchImpl?: typeof fetch;
  isReady?: (response: Response) => boolean | Promise<boolean>;
};

export type WaitForHttpResult = {
  ok: true;
  status: number;
  url: string;
  elapsedMs: number;
};

const PLACEHOLDER_TESTS: Array<(value: string) => boolean> = [
  (value) => value.length === 0,
  (value) => /\.\.\.$/.test(value),
  (value) => /your[_-]/i.test(value),
  (value) => /replace[_-]?me/i.test(value),
  (value) => /^changeme$/i.test(value),
  (value) => /example\.supabase\.co/i.test(value),
  (value) => /^re_your_/i.test(value),
  (value) => /\[YOUR-PASSWORD\]/i.test(value),
];

export function parseEnvFile(text: string | null | undefined): EnvMap {
  const out: EnvMap = {};
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

export function isPlaceholder(value: unknown): boolean {
  if (value == null) return true;
  const normalized = String(value).trim();
  return PLACEHOLDER_TESTS.some((test) => test(normalized));
}

export function readEnvValue(env: EnvMap, key: string): string | null {
  const value = env[key];
  if (value == null) return null;
  const normalized = String(value).trim();
  if (isPlaceholder(normalized)) return null;
  return normalized;
}

export function collectEnvIssues(env: EnvMap): EnvIssues {
  const missingRequired = REQUIRED_ENV_KEYS.filter(
    (key) => !readEnvValue(env, key),
  );
  const missingRecommended = RECOMMENDED_ENV_KEYS.filter(
    (key) => !readEnvValue(env, key),
  );
  return { missingRequired: [...missingRequired], missingRecommended: [...missingRecommended] };
}

export function parseNodeVersion(
  versionText: string | null | undefined,
): NodeVersion | null {
  const match = String(versionText ?? "").match(/v?(\d+)\.(\d+)\.(\d+)/);
  if (!match) return null;
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
}

export function meetsNodeRequirement(
  versionText: string | null | undefined,
  minMajor: number = MIN_NODE_MAJOR,
): boolean {
  const parsed = parseNodeVersion(versionText);
  return Boolean(parsed && parsed.major >= minMajor);
}

export function mergeEnvSources(...sources: Array<EnvMap | null | undefined>): EnvMap {
  const merged: EnvMap = {};
  for (const source of sources) {
    if (!source) continue;
    for (const [key, value] of Object.entries(source)) {
      if (value == null) continue;
      merged[key] = String(value);
    }
  }
  return merged;
}

export function mapSupabaseStatusEnv(statusEnv: EnvMap): EnvMap {
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

  const mapped: EnvMap = {
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

export function serializeEnvFile(
  env: EnvMap,
  headerLines: string[] = [],
): string {
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

export function escapeEnvValue(value: string): string {
  if (/[\s#"'$`]/.test(value)) {
    return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  }
  return value;
}

export function missingKeysMessage(missingRequired: string[]): string {
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

export function pickListenPort(
  preferredPort: number,
  usedPorts: Array<number | string> | null | undefined,
): number {
  const start = Number(preferredPort) || 3000;
  const occupied = new Set((usedPorts ?? []).map((port) => Number(port)));
  for (let port = start; port < start + 20; port += 1) {
    if (!occupied.has(port)) return port;
  }
  throw new Error(`No free port found from ${start} to ${start + 19}`);
}

export function parseListenerPid(
  ssOrLsofOutput: string | null | undefined,
  port: number,
): number | null {
  const text = String(ssOrLsofOutput ?? "");
  const portToken = `:${Number(port)}`;
  for (const line of text.split(/\r?\n/)) {
    if (!line.includes(portToken) && !/^\s*\d+\s*$/.test(line)) continue;
    const pidMatch = line.match(/pid=(\d+)/) || line.match(/^\s*(\d+)\s*$/);
    if (pidMatch) return Number(pidMatch[1]);
  }
  return null;
}

export function sameRepoPath(
  left: string | null | undefined,
  right: string | null | undefined,
): boolean {
  if (!left || !right) return false;
  const normalize = (value: string) =>
    String(value).replace(/\\/g, "/").replace(/\/+$/, "");
  return normalize(left) === normalize(right);
}

export function looksLikeRealestHtml(html: unknown): boolean {
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
}: {
  preferredPort?: number;
  repoRoot?: string;
  occupantCwd?: string | null;
  usedPorts?: Array<number | string>;
} = {}): PortDecision {
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

export async function waitForHttp(
  url: string,
  options: WaitForHttpOptions = {},
): Promise<WaitForHttpResult> {
  const timeoutMs = options.timeoutMs ?? 120_000;
  const intervalMs = options.intervalMs ?? 500;
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;
  const isReady =
    options.isReady ??
    ((response: Response) => response.status > 0 && response.status < 600);

  if (typeof fetchImpl !== "function") {
    throw new Error("fetch is not available");
  }

  const started = Date.now();
  let lastError: unknown = null;

  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetchImpl(url, {
        redirect: "manual",
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

export function startAppReadyLine(url: string): string {
  return `START_APP_READY url=${url}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
