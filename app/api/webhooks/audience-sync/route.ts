/**
 * POST /api/webhooks/audience-sync
 *
 * ⛔ RETIRED — returns 410 Gone.
 *
 * This webhook was a secondary / safety-net sync path that duplicated the
 * primary audience sync already handled in-line by the application routes:
 *
 *   POST   /api/waitlist  → syncWaitlistJoin()        (lib/resend-audiences)
 *   DELETE /api/waitlist  → syncWaitlistUnsubscribe()  (lib/resend-audiences)
 *   POST   /api/auth/...  → syncNewUser / syncRoleChange (lib/resend-audiences)
 *
 * The webhook approach also required Supabase Dashboard → Database → Webhooks
 * to be configured pointing at this URL, which was never done in production.
 *
 * Single source of truth: lib/resend-audiences.ts, called from route handlers.
 *
 * For the Resend→DB reverse direction (recovery after migrations), use:
 *   npx tsx scripts/import-resend-to-db.ts
 * or invoke the `resend-audience-sync` Supabase Edge Function.
 *
 * How to configure in Supabase:
 *   Dashboard → Database → Webhooks → Create a new webhook:
 *     Table:  public.users     Events: INSERT, UPDATE
 *     URL:    https://yourdomain.com/api/webhooks/audience-sync
 *     HTTP headers:
 *       x-webhook-secret: <same value as SUPABASE_WEBHOOK_SECRET>
 *
 *   Repeat for public.waitlist (INSERT, UPDATE events).
 *
 * Environment variables:
 *   SUPABASE_WEBHOOK_SECRET — a long random string, shared with Supabase webhook config
 */

import { NextRequest, NextResponse } from "next/server";
import {
  syncNewUser,
  syncRoleChange,
  syncWaitlistJoin,
  syncWaitlistUnsubscribe,
} from "@/lib/resend-audiences";

// ─── Supabase webhook payload types ──────────────────────────────────────────

type ChangeType = "INSERT" | "UPDATE" | "DELETE";

interface UsersRecord {
  id: string;
  email: string;
  full_name?: string | null;
  role?: "user" | "owner" | "agent" | "admin" | null;
  deleted_at?: string | null;
}

interface WaitlistRecord {
  id: string;
  email: string;
  first_name: string;
  last_name?: string | null;
  status: "active" | "unsubscribed" | "bounced";
}

interface WebhookPayload {
  type: ChangeType;
  table: string;
  schema: string;
  record: UsersRecord | WaitlistRecord | null;
  old_record: UsersRecord | WaitlistRecord | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.SUPABASE_WEBHOOK_SECRET;
  if (!secret) {
    // If no secret is configured, log a warning but allow through in development
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "⚠️  [WebhookAudienceSync] SUPABASE_WEBHOOK_SECRET not set — " +
        "running unauthenticated in development mode",
      );
      return true;
    }
    console.error(
      "❌ [WebhookAudienceSync] SUPABASE_WEBHOOK_SECRET not configured in production",
    );
    return false;
  }

  const incomingSecret = request.headers.get("x-webhook-secret");
  return incomingSecret === secret;
}

function parseName(fullName?: string | null): { firstName: string; lastName?: string } {
  if (!fullName?.trim()) return { firstName: "RealEST User" };
  const parts = fullName.trim().split(/\s+/);
  const firstName = parts[0] ?? "RealEST User";
  const lastName  = parts.length > 1 ? parts.slice(1).join(" ") : undefined;
  return { firstName, lastName };
}

// ─── Event handlers ───────────────────────────────────────────────────────────

async function handleUsersInsert(record: UsersRecord): Promise<void> {
  if (!record.email) return;

  // Skip admin users — they're internal, not audience targets
  if (record.role === "admin") return;

  const { firstName, lastName } = parseName(record.full_name);

  if (record.role === "owner") {
    await syncRoleChange(record.email, firstName, "owner", lastName);
  } else if (record.role === "agent") {
    await syncRoleChange(record.email, firstName, "agent", lastName);
  } else {
    // Default: regular user
    await syncNewUser(record.email, firstName, lastName);
  }
}

async function handleUsersUpdate(
  record: UsersRecord,
  oldRecord: UsersRecord,
): Promise<void> {
  if (!record.email) return;

  // Account deletion — hard delete handled by dedicated deletion flow
  // (removeFromAllAudiences called from the account deletion API route)
  if (record.deleted_at && !oldRecord.deleted_at) {
    console.log(
      `ℹ️  [WebhookAudienceSync] Soft-deleted account ${record.email} — ` +
      "hard deletion handled by account-deletion flow",
    );
    return;
  }

  const roleChanged = record.role !== oldRecord.role;
  if (!roleChanged) return; // Nothing relevant changed

  const { firstName, lastName } = parseName(record.full_name);

  if (record.role === "owner") {
    await syncRoleChange(record.email, firstName, "owner", lastName);
  } else if (record.role === "agent") {
    await syncRoleChange(record.email, firstName, "agent", lastName);
  }
  // Downgrade (owner/agent → user) is uncommon but handled by addContact to USERS
}

async function handleWaitlistInsert(record: WaitlistRecord): Promise<void> {
  if (!record.email || record.status !== "active") return;
  await syncWaitlistJoin(record.email, record.first_name, record.last_name ?? undefined);
}

async function handleWaitlistUpdate(
  record: WaitlistRecord,
  oldRecord: WaitlistRecord,
): Promise<void> {
  if (!record.email) return;

  const statusChanged = record.status !== oldRecord.status;
  if (!statusChanged) return;

  if (record.status === "active" && oldRecord.status !== "active") {
    // Re-subscribed
    await syncWaitlistJoin(record.email, record.first_name, record.last_name ?? undefined);
  } else if (record.status === "unsubscribed" && oldRecord.status === "active") {
    await syncWaitlistUnsubscribe(record.email);
  }
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  // 1. Auth check
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Parse payload
  let payload: WebhookPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const { type, table, schema, record, old_record } = payload;

  console.log(
    `🔔 [WebhookAudienceSync] ${schema}.${table} ${type} — ` +
    `email: ${(record as any)?.email ?? "unknown"}`,
  );

  // 3. Dispatch to correct handler — wrapped in try/catch so webhook always returns 200
  try {
    if (schema !== "public") {
      return NextResponse.json({ ok: true, skipped: "non-public schema" });
    }

    if (table === "users") {
      if (type === "INSERT" && record) {
        await handleUsersInsert(record as UsersRecord);
      } else if (type === "UPDATE" && record && old_record) {
        await handleUsersUpdate(record as UsersRecord, old_record as UsersRecord);
      }
    } else if (table === "waitlist") {
      if (type === "INSERT" && record) {
        await handleWaitlistInsert(record as WaitlistRecord);
      } else if (type === "UPDATE" && record && old_record) {
        await handleWaitlistUpdate(record as WaitlistRecord, old_record as WaitlistRecord);
      }
    } else {
      console.log(`ℹ️  [WebhookAudienceSync] Unhandled table: ${table} — ignoring`);
    }
  } catch (err) {
    // Log but return 200 — prevents Supabase from marking the webhook as failed
    console.error(
      `❌ [WebhookAudienceSync] Error processing ${table} ${type}:`,
      err instanceof Error ? err.message : err,
    );
  }

  return NextResponse.json({ ok: true });
}
