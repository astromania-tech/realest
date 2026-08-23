/**
 * supabase/functions/resend-audience-sync/index.ts
 *
 * Supabase Edge Function — Resend → Supabase DB reverse sync.
 *
 * Direction: Resend audiences → public.waitlist + public.resend_audience_contacts
 *
 * Purpose:
 *   Recovery / admin tool. Pulls all contacts from the configured Resend
 *   audiences and upserts them into the local database. Useful after a DB
 *   migration wipe or any situation where Resend has more records than the DB.
 *
 * This is NOT the primary sync path. The primary sync is:
 *   App route → lib/resend-audiences.ts → Resend API  (DB change triggers Resend update)
 *
 * Invoke:
 *   supabase functions invoke resend-audience-sync --no-verify-jwt
 *   OR via Supabase dashboard → Edge Functions → resend-audience-sync → Invoke
 *
 * Environment variables (set in Supabase dashboard → Edge Functions → Secrets):
 *   RESEND_API_KEY        — Resend secret key
 *   SUPABASE_URL          — auto-injected by Supabase runtime
 *   SUPABASE_SECRET_KEYS  — JSON object: { "default": "<service_role_key>" }
 *   RESEND_AUDIENCE_IDS   — JSON array of audience IDs to pull from
 *                           e.g. ["b52453fa-...", "399a4e25-...", "a5dde806-..."]
 *                           Falls back to the three hardcoded IDs if not set.
 */

import { createClient } from "npm:@supabase/supabase-js@2.49.1";

type ResendContact = {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  unsubscribed?: boolean;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function fetchResendAudienceContacts(params: {
  resendKey: string;
  audienceId: string;
}): Promise<ResendContact[]> {
  const { resendKey, audienceId } = params;
  const url = `https://api.resend.com/audiences/${audienceId}/contacts`;

  const r = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
  });

  if (!r.ok) {
    const text = await r.text();
    throw new Error(
      `Resend audience fetch failed (${audienceId}): ${r.status} ${text}`,
    );
  }

  const payload = await r.json();
  const contacts: ResendContact[] = payload?.data ?? payload?.contacts ?? [];
  return contacts;
}

function isTestEmail(email: string): boolean {
  const lower = email.toLowerCase();
  // Skip clearly fake / test / e2e emails
  if (lower.endsWith("@example.com")) return true;
  if (lower.startsWith("e2e.")) return true;
  if (lower.startsWith("test.") && lower.includes("@example")) return true;
  return false;
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) return jsonResponse({ error: "Missing RESEND_API_KEY" }, 500);

  const rawSecretKeys = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (!rawSecretKeys) return jsonResponse({ error: "Missing SUPABASE_SECRET_KEYS" }, 500);

  const secretKeys = JSON.parse(rawSecretKeys) as Record<string, string>;
  const serviceRoleKey = secretKeys["default"];
  if (!serviceRoleKey) {
    return jsonResponse({ error: "Missing service_role in SUPABASE_SECRET_KEYS" }, 500);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  if (!supabaseUrl) throw new Error("SUPABASE_URL is required");

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  // Audience IDs — prefer env var, fall back to known IDs
  const rawAudienceIds = Deno.env.get("RESEND_AUDIENCE_IDS");
  const audiences: string[] = rawAudienceIds
    ? (JSON.parse(rawAudienceIds) as string[])
    : [
        "b52453fa-50d5-4350-b745-4528b551adcd", // WAITLIST
        "399a4e25-957e-4b21-947e-efcf1ee6c354", // OWNERS
        "a5dde806-ca49-4657-a15f-85656c56acbd", // AGENTS / USERS (shared)
      ];

  let importedContacts = 0;
  let skippedContacts = 0;
  const details: Array<{ audienceId: string; email: string; resendContactId: string; action: string }> = [];

  for (const audienceId of audiences) {
    let contacts: ResendContact[];
    try {
      contacts = await fetchResendAudienceContacts({ resendKey: resendApiKey, audienceId });
    } catch (err) {
      return jsonResponse({ error: String(err) }, 500);
    }

    for (const c of contacts) {
      if (!c?.id || !c?.email) continue;

      const email = normalizeEmail(c.email);

      // Skip test / e2e emails
      if (isTestEmail(email)) {
        skippedContacts++;
        continue;
      }

      // Skip contacts unsubscribed in Resend
      if (c.unsubscribed === true) {
        skippedContacts++;
        continue;
      }

      const firstName = c.first_name ?? null;
      const lastName = c.last_name ?? null;

      // Upsert waitlist by email
      const { data: waitRows, error: findErr } = await supabase
        .from("waitlist")
        .select("id")
        .eq("email", email)
        .limit(1);

      if (findErr) return jsonResponse({ error: findErr.message }, 500);

      let waitlistId: string;
      let action: string;

      if (waitRows && waitRows.length > 0) {
        // Already exists — only update name if it was null
        waitlistId = waitRows[0].id;
        const { error: updErr } = await supabase
          .from("waitlist")
          .update({
            ...(firstName ? { first_name: firstName } : {}),
            ...(lastName ? { last_name: lastName } : {}),
          })
          .eq("id", waitlistId);

        if (updErr) return jsonResponse({ error: updErr.message }, 500);
        action = "updated";
      } else {
        // New contact — generate referral code
        const referralCode = crypto.randomUUID().replace(/-/g, "").substring(0, 8).toUpperCase();

        const { data: insRow, error: insErr } = await supabase
          .from("waitlist")
          .insert({
            email,
            first_name: firstName ?? "Waitlist",
            last_name: lastName,
            status: "active",
            persona: "buyer_renter",
            source: "resend_import",
            referral_code: referralCode,
            queue_score: 0,
            subscribed_at: new Date().toISOString(),
          })
          .select("id")
          .single();

        if (insErr) return jsonResponse({ error: insErr.message }, 500);
        waitlistId = insRow.id;
        action = "inserted";
      }

      // Upsert mapping row
      const { error: mapErr } = await supabase
        .from("resend_audience_contacts")
        .upsert(
          {
            resend_audience_id: audienceId,
            resend_contact_id: c.id,
            waitlist_id: waitlistId,
            email_snapshot: email,
            first_name_snapshot: firstName,
            last_name_snapshot: lastName,
          },
          { onConflict: "resend_audience_id,resend_contact_id" },
        );

      if (mapErr) return jsonResponse({ error: mapErr.message }, 500);

      importedContacts += 1;
      details.push({ audienceId, email, resendContactId: c.id, action });
    }
  }

  return jsonResponse({
    ok: true,
    imported: importedContacts,
    skipped: skippedContacts,
    sample: details.slice(0, 20),
  });
});
