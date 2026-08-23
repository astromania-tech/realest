#!/usr/bin/env tsx
/**
 * scripts/import-resend-to-db.ts
 *
 * One-time reverse import: pulls real contacts from Resend WAITLIST audience
 * and upserts them into the Supabase public.waitlist table.
 *
 * Run:
 *   npx tsx scripts/import-resend-to-db.ts --dry-run   ← preview only
 *   npx tsx scripts/import-resend-to-db.ts             ← actually import
 *
 * Idempotent — safe to run multiple times. Existing rows are not overwritten
 * (only updated if first_name/last_name were null).
 *
 * Requires: RESEND_API_KEY, DATABASE_URL in .env
 */

import "dotenv/config";
// import { PrismaClient } from "@/lib/prisma/client";
import { prisma } from "../lib/prisma";

// ─── Config ───────────────────────────────────────────────────────────────────

const RESEND_KEY = process.env.RESEND_API_KEY ?? "";
if (!RESEND_KEY) { console.error("❌  RESEND_API_KEY not set"); process.exit(1); }

const DRY_RUN = process.argv.includes("--dry-run");

// Only import from the WAITLIST audience — that is the authoritative source
// for waitlist members. Owners/Agents audiences are for registered users and
// do not map to the waitlist table.
const WAITLIST_AUDIENCE_ID = process.env.RESEND_AUDIENCE_WAITLIST_ID
  ?? "b52453fa-50d5-4350-b745-4528b551adcd";

// const prisma = new PrismaClient();

// ─── Test-email detection (same rules as scrub script) ────────────────────────

function isTestEmail(email: string): boolean {
  const e = email.toLowerCase().trim();
  if (e.includes("@example.")) return true;
  if (e.startsWith("e2e.")) return true;

  const typoVariants = [
    "pre4ebi@gmail.cont", "pre4ebi@gmail.coo", "pre4ebi@gmail.cob", "pre4ebi@gmail.co",
  ];
  if (typoVariants.includes(e)) return true;

  const fakeAddresses = [
    "fsaf@fafa.com", "okoko@mfa.com", "ddindia1dd@edca.cao",
    "jok@jad.co", "jom@hn.sa", "da@hb.li", "john212@hmail.com", "joh@example.cp",
    "john@mail.coi", "john@mail.co", "john@mail.com", "john@gmail.com",
    "john@example.co", "john@example.coi", "john@example.coma", "john@example.con",
    "john@example.cm", "john@example.cp", "jamesbet@mail.co", "johnaxel@mail.com",
    "sam@gmail.com", "bellonjohn@gmail.com", "james@hi.co", "johncena@gmail.com",
    "james@marrow.com", "jane@example.com", "alamusu@mail.com",
    "sammyyoung5600@mail.co", "sammyyoung56@gmail.com", "sammyyuoung@gmail.co",
    "sammyyoung560@gmail.com", "sammyyoung500006@gmail.com",
    "sammyyoung5054506@gmail.com", "sammyyoung5000006@gmail.com",
    "okoyenset@yahoo.com", "john.smith@example.com", "test.user@example.com",
  ];
  if (fakeAddresses.includes(e)) return true;

  return false;
}

// ─── API helpers ──────────────────────────────────────────────────────────────

interface ResendContact {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  unsubscribed?: boolean;
  created_at?: string;
}

async function listContacts(audienceId: string): Promise<ResendContact[]> {
  const res = await fetch(`https://api.resend.com/audiences/${audienceId}/contacts`, {
    headers: { Authorization: `Bearer ${RESEND_KEY}` },
  });
  if (!res.ok) throw new Error(`Fetch failed (${audienceId}): ${res.status} ${await res.text()}`);
  const payload = await res.json() as { data?: ResendContact[] };
  return payload.data ?? [];
}

function generateReferralCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("═══════════════════════════════════════════════════════");
  console.log("  RealEST — Resend → Supabase Waitlist Import");
  console.log("═══════════════════════════════════════════════════════");
  if (DRY_RUN) console.log("⚠️   DRY RUN — no DB writes will happen\n");

  console.log(`\n📡 Fetching contacts from WAITLIST audience (${WAITLIST_AUDIENCE_ID})...`);
  const allContacts = await listContacts(WAITLIST_AUDIENCE_ID);
  console.log(`   ${allContacts.length} total contacts in Resend`);

  // Filter out test emails and unsubscribed
  const realContacts = allContacts.filter(c => {
    if (!c.email) return false;
    if (isTestEmail(c.email)) return false;
    if (c.unsubscribed === true) return false;
    return true;
  });

  const testCount = allContacts.length - realContacts.length;
  console.log(`   ${testCount} skipped (test/fake/unsubscribed)`);
  console.log(`   ${realContacts.length} to process\n`);

  let inserted = 0;
  let updated  = 0;
  let skipped  = 0;
  const errors: string[] = [];

  for (let i = 0; i < realContacts.length; i++) {
    const c = realContacts[i];
    const email = c.email.trim().toLowerCase();
    const firstName = (c.first_name?.trim() || null);
    const lastName  = (c.last_name?.trim()  || null);

    process.stdout.write(`   [${i + 1}/${realContacts.length}] ${email.padEnd(40)}`);

    try {
      const existing = await prisma.waitlist.findUnique({
        where: { email },
        select: { id: true, first_name: true, last_name: true },
      });

      if (existing) {
        // Update names only if currently null/empty
        const needsUpdate =
          (firstName && !existing.first_name) ||
          (lastName  && !existing.last_name);

        if (!DRY_RUN && needsUpdate) {
          await prisma.waitlist.update({
            where: { email },
            data: {
              ...(firstName && !existing.first_name ? { first_name: firstName } : {}),
              ...(lastName  && !existing.last_name  ? { last_name:  lastName  } : {}),
            },
          });
        }

        process.stdout.write(needsUpdate ? "  → updated (name filled)\n" : "  → already exists, skipped\n");
        needsUpdate ? updated++ : skipped++;
      } else {
        if (!DRY_RUN) {
          await prisma.waitlist.create({
            data: {
              email,
              first_name: firstName ?? "Waitlist",
              last_name:  lastName,
              status:     "active",
              persona:    "buyer_renter",
              source:     "resend_import",
              referral_code: generateReferralCode(),
              queue_score:   0,
              subscribed_at: new Date(),
            },
          });
        }
        process.stdout.write("  → INSERTED\n");
        inserted++;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      process.stdout.write(`  → ERROR: ${msg}\n`);
      errors.push(`${email}: ${msg}`);
    }
  }

  console.log("\n═══════════════════════════════════════════════════════");
  console.log(`  Results:`);
  console.log(`    Inserted : ${inserted}`);
  console.log(`    Updated  : ${updated} (names filled)`);
  console.log(`    Skipped  : ${skipped} (already in DB)`);
  console.log(`    Errors   : ${errors.length}`);
  if (errors.length > 0) {
    console.log("\n  Errors:");
    errors.forEach(e => console.log(`    ✗ ${e}`));
  }
  if (DRY_RUN) console.log("\n  Run without --dry-run to apply changes.");
  console.log("═══════════════════════════════════════════════════════");

  // Final DB count
  if (!DRY_RUN) {
    const dbCount = await prisma.waitlist.count({ where: { status: "active" } });
    console.log(`\n✅ DB waitlist now has ${dbCount} active members.`);
  }
}

main()
  .catch(err => { console.error("❌ Fatal:", err); process.exit(1); })
  .finally(() => prisma.$disconnect());
