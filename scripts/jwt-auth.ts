import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

export type JwtInspectResult =
  | { valid: true; reason: "valid"; expiresAt: number | null }
  | { valid: false; reason: "missing" | "malformed" | "expired" | "unreadable"; expiresAt?: number };

export type LoadSupabaseAccessTokenOptions = {
  label: string;
  baseUrlEnvNames?: string[];
  anonKeyEnvNames?: string[];
  emailEnvNames?: string[];
  passwordEnvNames?: string[];
  refreshTokenEnvNames?: string[];
};

export type LoadJwtTokenOptions = {
  label: string;
  envNames?: string[];
  argvValue?: string;
};

type AuthJsonBody = {
  access_token?: unknown;
  error_description?: unknown;
  msg?: unknown;
  message?: unknown;
};

type PromptedSession =
  | { refreshToken: string }
  | { email: string; password: string };

function decodeBase64Url(value: string): string {
  return Buffer.from(value.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString(
    "utf8",
  );
}

export function inspectJwt(token: unknown): JwtInspectResult {
  if (typeof token !== "string" || !token.trim()) {
    return { valid: false, reason: "missing" };
  }

  const parts = token.trim().split(".");
  if (parts.length < 2) {
    return { valid: false, reason: "malformed" };
  }

  try {
    const payload = JSON.parse(decodeBase64Url(parts[1])) as { exp?: unknown };
    const now = Math.floor(Date.now() / 1000);

    if (typeof payload.exp === "number" && now >= payload.exp) {
      return { valid: false, reason: "expired", expiresAt: payload.exp };
    }

    return {
      valid: true,
      reason: "valid",
      expiresAt: typeof payload.exp === "number" ? payload.exp : null,
    };
  } catch {
    return { valid: false, reason: "unreadable" };
  }
}

function getEnvValue(envNames: string[] = []): string | null {
  for (const envName of envNames) {
    const value = process.env[envName];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function normalizeBaseUrl(value: string | null): string | null {
  if (!value) {
    return null;
  }

  return value.replace(/\/$/, "");
}

async function exchangePasswordForSession({
  baseUrl,
  anonKey,
  email,
  password,
  label,
}: {
  baseUrl: string;
  anonKey: string;
  email: string;
  password: string;
  label: string;
}): Promise<string> {
  const response = await fetch(`${baseUrl}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: anonKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const body = (await response.json().catch(() => ({}))) as AuthJsonBody;
  if (!response.ok) {
    const message =
      (typeof body.error_description === "string" && body.error_description) ||
      (typeof body.msg === "string" && body.msg) ||
      (typeof body.message === "string" && body.message) ||
      "password grant failed";
    throw new Error(
      `${label} login failed: ${response.status} ${response.statusText} — ${message}`,
    );
  }

  if (typeof body.access_token !== "string" || !body.access_token) {
    throw new Error(`${label} login succeeded but no access token was returned`);
  }

  return body.access_token;
}

async function exchangeRefreshTokenForSession({
  baseUrl,
  anonKey,
  refreshToken,
  label,
}: {
  baseUrl: string;
  anonKey: string;
  refreshToken: string;
  label: string;
}): Promise<string> {
  const response = await fetch(`${baseUrl}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    headers: {
      apikey: anonKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  const body = (await response.json().catch(() => ({}))) as AuthJsonBody;
  if (!response.ok) {
    const message =
      (typeof body.error_description === "string" && body.error_description) ||
      (typeof body.msg === "string" && body.msg) ||
      (typeof body.message === "string" && body.message) ||
      "refresh token exchange failed";
    throw new Error(
      `${label} refresh failed: ${response.status} ${response.statusText} — ${message}`,
    );
  }

  if (typeof body.access_token !== "string" || !body.access_token) {
    throw new Error(`${label} refresh succeeded but no access token was returned`);
  }

  return body.access_token;
}

async function promptForSupabaseSession(label: string): Promise<PromptedSession> {
  const rl = readline.createInterface({ input, output });

  try {
    const method = (
      await rl.question(
        `${label} session not found in env. Use refresh token or password login? [refresh/password] `,
      )
    )
      .trim()
      .toLowerCase();

    if (method === "refresh") {
      const refreshToken = (await rl.question(`Paste ${label} refresh token: `)).trim();
      if (!refreshToken) {
        throw new Error(`No ${label} refresh token provided`);
      }

      return { refreshToken };
    }

    const email = (await rl.question(`Paste ${label} email: `)).trim();
    const password = (await rl.question(`Paste ${label} password: `)).trim();
    if (!email || !password) {
      throw new Error(`No ${label} email/password provided`);
    }

    return { email, password };
  } finally {
    rl.close();
  }
}

export async function loadSupabaseAccessToken({
  label,
  baseUrlEnvNames = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL"],
  anonKeyEnvNames = ["NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_ANON_KEY"],
  emailEnvNames = [],
  passwordEnvNames = [],
  refreshTokenEnvNames = [],
}: LoadSupabaseAccessTokenOptions): Promise<string> {
  const baseUrl = normalizeBaseUrl(getEnvValue(baseUrlEnvNames));
  const anonKey = getEnvValue(anonKeyEnvNames);

  if (!baseUrl) {
    throw new Error(
      `Missing Supabase URL for ${label}. Set one of: ${baseUrlEnvNames.join(", ")}`,
    );
  }

  if (!anonKey) {
    throw new Error(
      `Missing Supabase anon key for ${label}. Set one of: ${anonKeyEnvNames.join(", ")}`,
    );
  }

  const refreshToken = getEnvValue(refreshTokenEnvNames);
  if (refreshToken) {
    return exchangeRefreshTokenForSession({ baseUrl, anonKey, refreshToken, label });
  }

  const email = getEnvValue(emailEnvNames);
  const password = getEnvValue(passwordEnvNames);
  if (email && password) {
    return exchangePasswordForSession({ baseUrl, anonKey, email, password, label });
  }

  const prompted = await promptForSupabaseSession(label);
  if ("refreshToken" in prompted) {
    return exchangeRefreshTokenForSession({
      baseUrl,
      anonKey,
      refreshToken: prompted.refreshToken,
      label,
    });
  }

  return exchangePasswordForSession({
    baseUrl,
    anonKey,
    email: prompted.email,
    password: prompted.password,
    label,
  });
}

async function promptForFreshJwt(label: string, reason: string): Promise<string> {
  const rl = readline.createInterface({ input, output });

  try {
    const confirmation = (
      await rl.question(`${label} JWT is ${reason}. Enter a new one now? [y/N] `)
    )
      .trim()
      .toLowerCase();
    if (confirmation !== "y" && confirmation !== "yes") {
      throw new Error(`No fresh ${label} JWT provided`);
    }

    const token = (await rl.question(`Paste ${label} JWT: `)).trim();
    const validation = inspectJwt(token);
    if (!validation.valid) {
      throw new Error(`Provided ${label} JWT is ${validation.reason}`);
    }

    return token;
  } finally {
    rl.close();
  }
}

export async function loadJwtToken({
  label,
  envNames = [],
  argvValue,
}: LoadJwtTokenOptions): Promise<string> {
  const candidates: Array<{ source: string; token: string }> = [];

  if (typeof argvValue === "string" && argvValue.trim()) {
    candidates.push({ source: "argv", token: argvValue.trim() });
  }

  for (const envName of envNames) {
    const envToken = process.env[envName];
    if (typeof envToken === "string" && envToken.trim()) {
      candidates.push({ source: envName, token: envToken.trim() });
    }
  }

  for (const candidate of candidates) {
    const validation = inspectJwt(candidate.token);
    if (validation.valid) {
      return candidate.token;
    }
  }

  const existing = candidates[0];
  const reason = existing ? inspectJwt(existing.token).reason : "missing";
  return promptForFreshJwt(label, reason);
}
