#!/usr/bin/env tsx
/**
 * scripts/seed-resend-audiences.ts
 *
 * One-time bulk import script to seed existing database users and waitlist
 * members into their respective Resend audiences.
 *
 * Run ONCE after configuring all RESEND_AUDIENCE_*_ID env vars in .env.local:
 *
 *   npx tsx scripts/seed-resend-audiences.ts
 *
 * Options:
 *   --dry-run     — Print what would be imported without calling Resend API
 *   --only=X      — Import only one audience: waitlist | users | owners | agents
 *   --batch=N     — Contacts per API batch (default: 50)
 *
 * The script is idempotent — re-running will upsert contacts already in Resend.
 *
 * Requirements:
 *   RESEND_API_KEY
 *   RESEND_AUDIENCE_WAITLIST_ID
 *   RESEND_AUDIENCE_USERS_ID
 *   RESEND_AUDIENCE_OWNERS_ID
 *   RESEND_AUDIENCE_AGENTS_ID
 *   DATABASE_URL (used by Prisma)
 */

import "dotenv/config";
import { prisma } from "../lib/prisma";
import { Resend } from "resend";

// ─── Configuration ────────────────────────────────────────────────────────────

const AUDIENCE_IDS = {
  WAITLIST: process.env.RESEND_AUDIENCE_WAITLIST_ID ?? "",
  USERS:    process.env.RESEND_AUDIENCE_USERS_ID    ?? "",
  OWNERS:   process.env.RESEND_AUDIENCE_OWNERS_ID   ?? "",
  AGENTS:   process.env.RESEND_AUDIENCE_AGENTS_ID   ?? "",
};

const args           = process.argv.slice(2);
const DRY_RUN        = args.includes("--dry-run");
const ONLY_AUDIENCE  = args.find((a) => a.startsWith("--only="))?.split("=")[1]?.toUpperCase();
const BATCH_ARG      = args.find((a) => a.startsWith("--batch="))?.split("=")[1];
const BATCH_SIZE     = parseInt(BATCH_ARG ?? "50", 10);

const resend = new Resend(process.env.RESEND_API_KEY ?? "");

// ─── Types ────────────────────────────────────────────────────────────────────

interface ContactPayload {
  email: string;
  firstName?: string;
  lastName?:  string;
  unsubscribed: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseName(fullName?: string | null): { firstName: string; lastName?: string } {
  if (!fullName?.trim()) return { firstName: "" };
  const parts = fullName.trim().split(/\s+/);
  return {
    firstName: parts[0] ?? "",
    lastName:  parts.length > 1 ? parts.slice(1).join(" ") : undefined,
  };
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function importBatch(
  audienceId: string,
  audienceName: string,
  contacts: ContactPayload[],
): Promise<{ imported: number; failed: number }> {
  let imported = 0;
  let failed   = 0;

  // Process one contact at a time with a 550ms gap — Resend allows 2 req/sec
  for (let i = 0; i < contacts.length; i++) {
    const c = contacts[i];

    if (DRY_RUN) {
      console.log(`  [DRY RUN] Would upsert ${c.email} → ${audienceName}`);
      imported++;
    } else {
      const { error } = await resend.contacts.create({
        audienceId,
        email:        c.email,
        firstName:    c.firstName,
        lastName:     c.lastName,
        unsubscribed: c.unsubscribed,
      });

      if (error) {
        console.warn(`  ⚠️  Failed to upsert ${c.email}: ${(error as any).message ?? error}`);
        failed++;
      } else {
        imported++;
      }
    }

    process.stdout.write(`  Progress: ${i + 1}/${contacts.length}\r`);

    // 550ms between requests — keeps us safely under the 2 req/sec limit
    if (i < contacts.length - 1) {
      await sleep(550);
    }
  }

  process.stdout.write("\n");
  return { imported, failed };
}

// ─── Audience importers ───────────────────────────────────────────────────────

async function importWaitlist(): Promise<void> {
  const audienceId = AUDIENCE_IDS.WAITLIST;
  if (!audienceId) {
    console.warn("⏭️  RESEND_AUDIENCE_WAITLIST_ID not set — skipping Waitlist");
    return;
  }

  console.log("\n📋 Fetching waitlist from database...");

  const entries = await prisma.waitlist.findMany({
    select: {
      email:      true,
      first_name: true,
      last_name:  true,
      status:     true,
    },
  });

  const contacts: ContactPayload[] = entries.map((e: { email: string; first_name: string; last_name: string | null; status: string | null }) => ({
    email:        e.email,
    firstName:    e.first_name,
    lastName:     e.last_name ?? undefined,
    unsubscribed: e.status !== "active",
  }));

  console.log(`  Found ${contacts.length} waitlist entries`);

  const { imported, failed } = await importBatch(audienceId, "WAITLIST", contacts);
  console.log(`  ✅ WAITLIST: ${imported} imported, ${failed} failed`);
}

async function importUsers(): Promise<void> {
  const audienceId = AUDIENCE_IDS.USERS;
  if (!audienceId) {
    console.warn("⏭️  RESEND_AUDIENCE_USERS_ID not set — skipping Users");
    return;
  }

  console.log("\n👤 Fetching users (role: user) from database...");

  const users = await prisma.users.findMany({
    where: {
      role:       "user",
      deleted_at: null,
    },
    select: {
      email:     true,
      full_name: true,
    },
  });

  const contacts: ContactPayload[] = users
    .filter((u: { email: string | null; full_name: string | null }) => !!u.email)
    .map((u: { email: string | null; full_name: string | null }) => {
      const { firstName, lastName } = parseName(u.full_name);
      return {
        email:        u.email!,
        firstName,
        lastName,
        unsubscribed: false,
      };
    });

  console.log(`  Found ${contacts.length} regular users`);

  const { imported, failed } = await importBatch(audienceId, "USERS", contacts);
  console.log(`  ✅ USERS: ${imported} imported, ${failed} failed`);
}

async function importOwners(): Promise<void> {
  const audienceId = AUDIENCE_IDS.OWNERS;
  if (!audienceId) {
    console.warn("⏭️  RESEND_AUDIENCE_OWNERS_ID not set — skipping Owners");
    return;
  }

  console.log("\n🏠 Fetching owners (role: owner) from database...");

  const owners = await prisma.users.findMany({
    where: {
      role:       "owner",
      deleted_at: null,
    },
    select: {
      email:     true,
      full_name: true,
    },
  });

  const contacts: ContactPayload[] = owners
    .filter((u: { email: string | null; full_name: string | null }) => !!u.email)
    .map((u: { email: string | null; full_name: string | null }) => {
      const { firstName, lastName } = parseName(u.full_name);
      return {
        email:        u.email!,
        firstName,
        lastName,
        unsubscribed: false,
      };
    });

  console.log(`  Found ${contacts.length} property owners`);

  const { imported, failed } = await importBatch(audienceId, "OWNERS", contacts);
  console.log(`  ✅ OWNERS: ${imported} imported, ${failed} failed`);
}

async function importAgents(): Promise<void> {
  const audienceId = AUDIENCE_IDS.AGENTS;
  if (!audienceId) {
    console.warn("⏭️  RESEND_AUDIENCE_AGENTS_ID not set — skipping Agents");
    return;
  }

  console.log("\n🔑 Fetching agents (role: agent) from database...");

  const agents = await prisma.users.findMany({
    where: {
      role:       "agent",
      deleted_at: null,
    },
    select: {
      email:     true,
      full_name: true,
    },
  });

  const contacts: ContactPayload[] = agents
    .filter((u: { email: string | null; full_name: string | null }) => !!u.email)
    .map((u: { email: string | null; full_name: string | null }) => {
      const { firstName, lastName } = parseName(u.full_name);
      return {
        email:        u.email!,
        firstName,
        lastName,
        unsubscribed: false,
      };
    });

  console.log(`  Found ${contacts.length} agents`);

  const { imported, failed } = await importBatch(audienceId, "AGENTS", contacts);
  console.log(`  ✅ AGENTS: ${imported} imported, ${failed} failed`);
}

// ─── Entrypoint ───────────────────────────────────────────────────────────────

async function main() {
  console.log("═══════════════════════════════════════════════════════");
  console.log("  RealEST — Resend Audience Seed Import");
  console.log("═══════════════════════════════════════════════════════");

  if (!process.env.RESEND_API_KEY) {
    console.error("❌ RESEND_API_KEY is not set. Aborting.");
    process.exit(1);
  }

  if (DRY_RUN) {
    console.log("⚠️  DRY RUN mode — no API calls will be made to Resend\n");
  }

  if (ONLY_AUDIENCE) {
    console.log(`ℹ️  Running for audience only: ${ONLY_AUDIENCE}\n`);
  }

  const startTime = Date.now();

  try {
    const shouldRun = (name: string) =>
      !ONLY_AUDIENCE || ONLY_AUDIENCE === name;

    if (shouldRun("WAITLIST")) await importWaitlist();
    if (shouldRun("USERS"))    await importUsers();
    if (shouldRun("OWNERS"))   await importOwners();
    if (shouldRun("AGENTS"))   await importAgents();

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n✅ Seed import complete in ${elapsed}s`);
  } catch (err) {
    console.error("\n❌ Fatal error during seed import:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
