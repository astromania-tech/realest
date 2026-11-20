export interface WaitlistContextResponse {
  exists?: boolean;
  status?: string | null;
}

interface SubmitSignupWithBestEffortWaitlistOptions<T> {
  email: string;
  signup: () => Promise<T>;
  onWaitlistContext?: (context: WaitlistContextResponse) => void;
  fetcher?: typeof fetch;
}

/**
 * The public waitlist lookup only supplies optional UI context. Signup role
 * resolution is performed separately by the server and remains authoritative.
 */
export async function submitSignupWithBestEffortWaitlist<T>({
  email,
  signup,
  onWaitlistContext,
  fetcher = fetch,
}: SubmitSignupWithBestEffortWaitlistOptions<T>): Promise<T> {
  try {
    const response = await fetcher(
      `/api/waitlist?email=${encodeURIComponent(email.trim().toLowerCase())}`,
    );

    if (response.ok) {
      const context: unknown = await response.json();
      if (context && typeof context === "object" && !Array.isArray(context)) {
        onWaitlistContext?.(context as WaitlistContextResponse);
      }
    }
  } catch {
    // A failed preflight must not block registration. The signup API performs
    // the authoritative role lookup before creating an Auth account.
  }

  return signup();
}
