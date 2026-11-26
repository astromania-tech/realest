export interface WaitlistContextResponse {
  exists?: boolean;
  status?: string | null;
}

interface SubmitSignupWithBestEffortWaitlistOptions<T> {
  email: string;
  signup: () => Promise<T>;
  onWaitlistContext?: (context: WaitlistContextResponse) => void;
  fetcher?: typeof fetch;
  timeoutMs?: number;
}

const WAITLIST_PREFLIGHT_TIMEOUT_MS = 2_000;

/**
 * The public waitlist lookup only supplies optional UI context. Signup role
 * resolution is performed separately by the server and remains authoritative.
 */
export async function submitSignupWithBestEffortWaitlist<T>({
  email,
  signup,
  onWaitlistContext,
  fetcher = fetch,
  timeoutMs = WAITLIST_PREFLIGHT_TIMEOUT_MS,
}: SubmitSignupWithBestEffortWaitlistOptions<T>): Promise<T> {
  const controller = new AbortController();
  let timedOut = false;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    const lookup = (async () => {
      const response = await fetcher(
        `/api/waitlist?email=${encodeURIComponent(email.trim().toLowerCase())}`,
        { signal: controller.signal },
      );

      if (!timedOut && response.ok) {
        const context: unknown = await response.json();
        if (
          !timedOut &&
          context &&
          typeof context === "object" &&
          !Array.isArray(context)
        ) {
          onWaitlistContext?.(context as WaitlistContextResponse);
        }
      }

    })();

    await Promise.race([
      lookup,
      new Promise<void>((resolve) => {
        timeoutId = setTimeout(() => {
          timedOut = true;
          controller.abort();
          resolve();
        }, timeoutMs);
      }),
    ]);
  } catch {
    // A failed preflight must not block registration. The signup API performs
    // the authoritative role lookup before creating an Auth account.
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }

  return signup();
}
