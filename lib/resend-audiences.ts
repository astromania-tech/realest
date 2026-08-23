/**
 * lib/resend-audiences.ts
 *
 * Resend Audience / Contacts sync utility for RealEST.
 *
 * Architecture:
 *   - One Resend Audience per user segment (Waitlist, Users, Owners, Agents)
 *   - `create` is called for adds — Resend upserts by email, so it's safe to call repeatedly
 *   - Marking `unsubscribed: true` via `create` handles soft-removal (no ID needed)
 *   - Hard deletion (GDPR/account deletion) is the only case that requires a list lookup by email
 *
 * Environment variables required in .env.local:
 *   RESEND_API_KEY                  — your Resend secret key
 *   RESEND_AUDIENCE_WAITLIST_ID     — ID of the "Waitlist" audience in Resend dashboard
 *   RESEND_AUDIENCE_USERS_ID        — ID of the "Users" audience
 *   RESEND_AUDIENCE_OWNERS_ID       — ID of the "Owners" audience
 *   RESEND_AUDIENCE_AGENTS_ID       — ID of the "Agents" audience
 *
 * How to get audience IDs:
 *   Dashboard → Broadcasts → Audiences → click an audience → copy the ID from the URL
 *
 * NOTE: All sync calls are fire-and-forget safe (never throw). They log errors
 *       without blocking the main request flow.
 */

import { Resend } from "resend";

// ─── Audience registry ────────────────────────────────────────────────────────

export const AUDIENCE_IDS = {
  WAITLIST: process.env.RESEND_AUDIENCE_WAITLIST_ID ?? "",
  USERS:    process.env.RESEND_AUDIENCE_USERS_ID    ?? "",
  OWNERS:   process.env.RESEND_AUDIENCE_OWNERS_ID   ?? "",
  AGENTS:   process.env.RESEND_AUDIENCE_AGENTS_ID   ?? "",
} as const;

export type AudienceName = keyof typeof AUDIENCE_IDS;

export interface ContactData {
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface AudienceSyncResult {
  success: boolean;
  contactId?: string;
  error?: string;
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    console.warn("⚠️  RESEND_API_KEY not configured — audience sync disabled");
    return null;
  }
  return new Resend(process.env.RESEND_API_KEY);
}

function isAudienceConfigured(audience: AudienceName): boolean {
  const id = AUDIENCE_IDS[audience];
  if (!id) {
    console.warn(`⚠️  RESEND_AUDIENCE_${audience}_ID not configured — skipping sync for ${audience}`);
    return false;
  }
  return true;
}

function extractErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === "object" && "message" in err) return String((err as any).message);
  return String(err);
}

// ─── Core API ─────────────────────────────────────────────────────────────────

/**
 * Add (or re-subscribe) a contact to a Resend audience.
 * Safe to call multiple times — Resend upserts by email.
 */
export async function addContact(
  audience: AudienceName,
  data: ContactData,
): Promise<AudienceSyncResult> {
  const resend = getResend();
  if (!resend || !isAudienceConfigured(audience)) {
    return { success: false, error: "Not configured" };
  }

  const audienceId = AUDIENCE_IDS[audience];

  try {
    const { data: contact, error } = await resend.contacts.create({
      audienceId,
      email:        data.email,
      firstName:    data.firstName,
      lastName:     data.lastName,
      unsubscribed: false,
    });

    if (error) {
      console.error(`❌ [ResendAudience] Failed to add ${data.email} → ${audience}:`, error);
      return { success: false, error: extractErrorMessage(error) };
    }

    console.log(`✅ [ResendAudience] Added ${data.email} → ${audience}`);
    return { success: true, contactId: (contact as any)?.id };
  } catch (err) {
    console.error(`❌ [ResendAudience] Unexpected error adding ${data.email} → ${audience}:`, err);
    return { success: false, error: extractErrorMessage(err) };
  }
}

/**
 * Soft-remove a contact from a Resend audience by marking them as unsubscribed.
 * The contact stays in the audience but won't receive broadcasts.
 * Safe to call multiple times — Resend upserts by email.
 */
export async function unsubscribeContact(
  audience: AudienceName,
  email: string,
): Promise<AudienceSyncResult> {
  const resend = getResend();
  if (!resend || !isAudienceConfigured(audience)) {
    return { success: false, error: "Not configured" };
  }

  const audienceId = AUDIENCE_IDS[audience];

  try {
    const { data: contact, error } = await resend.contacts.create({
      audienceId,
      email,
      unsubscribed: true,
    });

    if (error) {
      console.error(`❌ [ResendAudience] Failed to unsubscribe ${email} from ${audience}:`, error);
      return { success: false, error: extractErrorMessage(error) };
    }

    console.log(`✅ [ResendAudience] Unsubscribed ${email} from ${audience}`);
    return { success: true, contactId: (contact as any)?.id };
  } catch (err) {
    console.error(`❌ [ResendAudience] Unexpected error unsubscribing ${email} from ${audience}:`, err);
    return { success: false, error: extractErrorMessage(err) };
  }
}

/**
 * Hard-delete a contact from a Resend audience.
 * Required for GDPR account deletion flows.
 * Performs a list lookup by email to resolve the contact ID, then deletes.
 */
export async function hardDeleteContact(
  audience: AudienceName,
  email: string,
): Promise<AudienceSyncResult> {
  const resend = getResend();
  if (!resend || !isAudienceConfigured(audience)) {
    return { success: false, error: "Not configured" };
  }

  const audienceId = AUDIENCE_IDS[audience];

  try {
    // Resolve contact ID by email (Resend doesn't support lookup by email directly)
    const { data: listResult, error: listError } = await resend.contacts.list({ audienceId });

    if (listError) {
      console.error(`❌ [ResendAudience] Failed to list contacts for ${audience}:`, listError);
      return { success: false, error: extractErrorMessage(listError) };
    }

    const contacts = (listResult as any)?.data ?? [];
    const contact = contacts.find(
      (c: any) => c.email?.toLowerCase() === email.toLowerCase(),
    );

    if (!contact) {
      // Already gone — idempotent success
      console.log(`ℹ️  [ResendAudience] ${email} not found in ${audience} — nothing to delete`);
      return { success: true };
    }

    const { error: deleteError } = await resend.contacts.remove({
      audienceId,
      id: contact.id,
    });

    if (deleteError) {
      console.error(`❌ [ResendAudience] Failed to hard-delete ${email} from ${audience}:`, deleteError);
      return { success: false, error: extractErrorMessage(deleteError) };
    }

    console.log(`✅ [ResendAudience] Hard-deleted ${email} from ${audience}`);
    return { success: true, contactId: contact.id };
  } catch (err) {
    console.error(`❌ [ResendAudience] Unexpected error hard-deleting ${email} from ${audience}:`, err);
    return { success: false, error: extractErrorMessage(err) };
  }
}

/**
 * Move a contact from one or more source audiences to a target audience.
 * Used for role transitions: user → owner, user → agent.
 * - Adds (with upsert) to the target audience
 * - Unsubscribes from all source audiences (soft removal — preserves analytics history)
 */
export async function moveContact(
  fromAudiences: AudienceName[],
  toAudience: AudienceName,
  data: ContactData,
): Promise<{ success: boolean; errors: string[] }> {
  const errors: string[] = [];

  // Add to target audience first
  const addResult = await addContact(toAudience, data);
  if (!addResult.success) {
    errors.push(`Add to ${toAudience}: ${addResult.error}`);
  }

  // Soft-remove from source audiences concurrently
  const removeResults = await Promise.allSettled(
    fromAudiences.map((a) => unsubscribeContact(a, data.email)),
  );

  removeResults.forEach((r, i) => {
    if (r.status === "rejected") {
      errors.push(`Unsubscribe from ${fromAudiences[i]}: ${r.reason}`);
    } else if (!r.value.success) {
      errors.push(`Unsubscribe from ${fromAudiences[i]}: ${r.value.error}`);
    }
  });

  if (errors.length > 0) {
    console.warn(`⚠️  [ResendAudience] moveContact had errors for ${data.email}:`, errors);
  }

  return { success: errors.length === 0, errors };
}

// ─── Domain-specific helpers ──────────────────────────────────────────────────

/**
 * Called when a user joins the waitlist.
 */
export async function syncWaitlistJoin(
  email: string,
  firstName: string,
  lastName?: string,
): Promise<AudienceSyncResult> {
  return addContact("WAITLIST", { email, firstName, lastName });
}

/**
 * Called when a user unsubscribes from the waitlist.
 */
export async function syncWaitlistUnsubscribe(email: string): Promise<AudienceSyncResult> {
  return unsubscribeContact("WAITLIST", email);
}

/**
 * Called when a new user account is created (role: user).
 * Also handles waitlist-to-registered conversion — the person may already be
 * in the WAITLIST audience; we DON'T remove them as they may still be on
 * the pre-launch list for marketing purposes.
 */
export async function syncNewUser(
  email: string,
  firstName: string,
  lastName?: string,
): Promise<AudienceSyncResult> {
  return addContact("USERS", { email, firstName, lastName });
}

/**
 * Called when a user's role changes to owner or agent (after onboarding completes).
 * Moves them out of the generic USERS audience and into their specific audience.
 */
export async function syncRoleChange(
  email: string,
  firstName: string,
  newRole: "owner" | "agent",
  lastName?: string,
): Promise<{ success: boolean; errors: string[] }> {
  const toAudience: AudienceName = newRole === "owner" ? "OWNERS" : "AGENTS";
  return moveContact(["USERS"], toAudience, { email, firstName, lastName });
}

/**
 * Called when a user account is fully deleted (GDPR).
 * Hard-deletes the contact from all audiences.
 */
export async function removeFromAllAudiences(email: string): Promise<void> {
  const audiences: AudienceName[] = ["WAITLIST", "USERS", "OWNERS", "AGENTS"];
  const results = await Promise.allSettled(
    audiences.map((a) => hardDeleteContact(a, email)),
  );

  const failed = results
    .map((r, i) => ({ audience: audiences[i], result: r }))
    .filter(
      ({ result }) =>
        result.status === "rejected" ||
        (result.status === "fulfilled" && !result.value.success),
    );

  if (failed.length > 0) {
    console.error(
      `❌ [ResendAudience] removeFromAllAudiences: some deletions failed for ${email}:`,
      failed.map(({ audience }) => audience),
    );
  }
}

// ─── Utility: check configuration status ─────────────────────────────────────

/**
 * Returns a configuration status object — useful for health-check endpoints.
 */
export function getAudienceConfig(): {
  configured: boolean;
  audiences: Record<AudienceName, boolean>;
  apiKeyPresent: boolean;
} {
  const apiKeyPresent = !!process.env.RESEND_API_KEY;
  const audiences = (Object.keys(AUDIENCE_IDS) as AudienceName[]).reduce(
    (acc, key) => {
      acc[key] = !!AUDIENCE_IDS[key];
      return acc;
    },
    {} as Record<AudienceName, boolean>,
  );

  const configured = apiKeyPresent && Object.values(audiences).every(Boolean);
  return { configured, audiences, apiKeyPresent };
}
