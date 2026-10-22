/**
 * Cloudflare Turnstile for public forms (waitlist).
 * Local without keys: skip. Production without keys: misconfigured (fail closed).
 */

export type TurnstileMode = "verify" | "skip" | "misconfigured";

export function turnstileSiteKey(): string | null {
  const key = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();
  return key || null;
}

export function turnstileSecretKey(): string | null {
  const key = process.env.TURNSTILE_SECRET_KEY?.trim();
  return key || null;
}

function isProductionRuntime(): boolean {
  if (process.env.NODE_ENV === "production") return true;
  const mode = process.env.NEXT_PUBLIC_APP_MODE;
  return mode === "coming-soon" || mode === "full-site";
}

export function turnstileMode(): TurnstileMode {
  const secret = turnstileSecretKey();
  if (secret) return "verify";
  if (isProductionRuntime()) return "misconfigured";
  return "skip";
}

export type TurnstileVerifyResult =
  | { ok: true; mode: TurnstileMode }
  | { ok: false; error: string; status: 403 | 503 };

/**
 * Verify a Turnstile response token with Cloudflare.
 * When mode is skip (local, no secret), accepts without calling Cloudflare.
 */
export async function verifyTurnstileToken(
  token: string | null | undefined,
  options?: {
    ip?: string | null;
    fetchImpl?: typeof fetch;
    mode?: TurnstileMode;
  },
): Promise<TurnstileVerifyResult> {
  const mode = options?.mode ?? turnstileMode();
  if (mode === "skip") return { ok: true, mode };
  if (mode === "misconfigured") {
    return {
      ok: false,
      error: "Waitlist bot check is not configured.",
      status: 503,
    };
  }

  const secret = turnstileSecretKey();
  if (!secret) {
    return {
      ok: false,
      error: "Waitlist bot check is not configured.",
      status: 503,
    };
  }

  if (!token || typeof token !== "string" || token.trim().length < 10) {
    return {
      ok: false,
      error: "Complete the bot check and try again.",
      status: 403,
    };
  }

  const body = new URLSearchParams();
  body.set("secret", secret);
  body.set("response", token.trim());
  if (options?.ip) body.set("remoteip", options.ip);

  const fetchImpl = options?.fetchImpl ?? fetch;
  try {
    const res = await fetchImpl(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body,
      },
    );
    if (!res.ok) {
      return {
        ok: false,
        error: "Bot check failed. Please try again.",
        status: 403,
      };
    }
    const data = (await res.json()) as { success?: boolean };
    if (!data.success) {
      return {
        ok: false,
        error: "Bot check failed. Please try again.",
        status: 403,
      };
    }
    return { ok: true, mode };
  } catch {
    return {
      ok: false,
      error: "Bot check failed. Please try again.",
      status: 403,
    };
  }
}
