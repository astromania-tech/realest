/**
 * Create or reset a local Supabase admin from ADMIN_EMAIL / ADMIN_PASSWORD.
 *
 *   npx tsx scripts/create-local-admin.ts
 *
 * Requires local Supabase running and .env.local with:
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 *   ADMIN_EMAIL, ADMIN_PASSWORD
 */
import { loadCliEnv } from "./lib/load-cli-env.ts";
import { createClient } from "@supabase/supabase-js";

loadCliEnv();

const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const email = (process.env.ADMIN_EMAIL || "").trim();
const password = process.env.ADMIN_PASSWORD || "";

async function main(): Promise<void> {
  if (!url || !serviceKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
    );
  }
  if (!email || !password) {
    throw new Error(
      "Set ADMIN_EMAIL and ADMIN_PASSWORD in .env.local before creating the local admin",
    );
  }
  if (!/127\.0\.0\.1|localhost/.test(url)) {
    throw new Error(
      `Refusing to create admin against non-local Supabase URL: ${url}`,
    );
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const list = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (list.error) {
    throw new Error(`listUsers failed: ${list.error.message}`);
  }

  const existing = (list.data.users || []).find(
    (u) => (u.email || "").toLowerCase() === email.toLowerCase(),
  );

  let userId: string;
  if (existing?.id) {
    const updated = await admin.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      user_metadata: {
        ...(existing.user_metadata || {}),
        full_name: existing.user_metadata?.full_name || "Local Admin",
        user_type: "admin",
      },
    });
    if (updated.error) {
      throw new Error(`updateUser failed: ${updated.error.message}`);
    }
    userId = existing.id;
    console.log(`Updated existing auth user ${email}`);
  } else {
    const created = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: "Local Admin",
        user_type: "admin",
      },
    });
    if (created.error) {
      throw new Error(`createUser failed: ${created.error.message}`);
    }
    if (!created.data.user?.id) {
      throw new Error("createUser returned no user id");
    }
    userId = created.data.user.id;
    console.log(`Created auth user ${email}`);
  }

  // Role source of truth is public.users.role (see consolidate-roles migration).
  const { error: roleError } = await admin.from("users").upsert(
    {
      id: userId,
      email,
      full_name: "Local Admin",
      role: "admin",
    },
    { onConflict: "id" },
  );
  if (roleError) {
    throw new Error(`users upsert failed: ${roleError.message}`);
  }

  const { error: profileError } = await admin.from("profiles").upsert(
    {
      id: userId,
      email,
      full_name: "Local Admin",
    },
    { onConflict: "id" },
  );
  if (profileError) {
    throw new Error(`profiles upsert failed: ${profileError.message}`);
  }

  // Prove password login works with anon key (same path as the smoke test).
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  if (!anonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  const loginRes = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  if (!loginRes.ok) {
    const text = await loginRes.text();
    throw new Error(`Password login check failed: ${loginRes.status} ${text}`);
  }

  console.log("Local admin ready.");
  console.log(`  id: ${userId}`);
  console.log(`  email: ${email}`);
  console.log("  role: admin (public.users)");
  console.log("Password login check: ok");
  console.log("Next: ensure the app is on :3000, then npm run test:validation");
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`create-local-admin failed: ${message}`);
  process.exit(1);
});
