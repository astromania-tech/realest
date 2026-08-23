#!/usr/bin/env tsx
/**
 * scripts/scrub-resend-test-contacts.ts
 *
 * Removes fake / test / seeded contacts from all Resend audiences.
 *
 * Run:
 *   npx tsx scripts/scrub-resend-test-contacts.ts --dry-run   ← preview only
 *   npx tsx scripts/scrub-resend-test-contacts.ts             ← actually delete
 *
 * Requires: RESEND_API_KEY in .env
 */

import "dotenv/config";

// ─── Config ───────────────────────────────────────────────────────────────────

const RESEND_KEY = process.env.RESEND_API_KEY ?? "";
if (!RESEND_KEY) { console.error("❌  RESEND_API_KEY not set"); process.exit(1); }

const DRY_RUN = process.argv.includes("--dry-run");

const AUDIENCES = [
  { id: "b52453fa-50d5-4350-b745-4528b551adcd", name: "WAITLIST" },
  { id: "399a4e25-957e-4b21-947e-efcf1ee6c354", name: "OWNERS"   },
  { id: "a5dde806-ca49-4657-a15f-85656c56acbd", name: "AGENTS"   },
];

// ─── Test-email detection ─────────────────────────────────────────────────────

/**
 * Returns true when the email is clearly fake, a seed entry, or a typo variant
 * created during the March 2026 manual seeding session.
 */
function isTestEmail(email: string): boolean {
  const e = email.toLowerCase().trim();

  // @example.com / @example.* domains
  if (e.includes("@example.")) return true;

  // E2E test patterns
  if (e.startsWith("e2e.")) return true;

  // Generic placeholder inboxes
  if (e === "test@example.com") return true;
  if (e === "test.user@example.com") return true;
  if (e === "john.smith@example.com") return true;

  // Typo variants of pre4ebi that were bulk-seeded
  const typoVariants = [
    "pre4ebi@gmail.cont",
    "pre4ebi@gmail.coo",
    "pre4ebi@gmail.cob",
    "pre4ebi@gmail.co",
  ];
  if (typoVariants.includes(e)) return true;

  // Clearly fake / garbled addresses from the seeding batch
  const fakeAddresses = [
    "fsaf@fafa.com",
    "okoko@mfa.com",
    "ddindia1dd@edca.cao",
    "jok@jad.co",
    "jom@hn.sa",
    "da@hb.li",
    "john212@hmail.com",
    "joh@example.cp",
    "john@mail.coi",
    "john@mail.co",
    "john@mail.com",     // generic
    "john@gmail.com",    // generic
    "john@example.co",
    "john@example.coi",
    "john@example.coma",
    "john@example.con",
    "john@example.cm",
    "john@example.cp",
    "jamesbet@mail.co",
    "johnaxel@mail.com",
    "sam@gmail.com",     // generic
    "bellonjohn@gmail.com",
    "james@hi.co",
    "johncena@gmail.com",  // clearly fake
    "james@marrow.com",    // clearly fake
    "jane@example.com",
    "alamusu@mail.com",
    "sammyyoung5600@mail.co",
    "sammyyoung56@gmail.com",
    "sammyyuoung@gmail.co",
    "sammyyoung560@gmail.com",
    "sammyyoung500006@gmail.com",
    "sammyyoung5054506@gmail.com",
    "sammyyoung5000006@gmail.com",
    "okoyenset@yahoo.com",
    "john.smith@example.com",
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
  if (!res.ok) throw new Error(`List failed (${audienceId}): ${res.status} ${await res.text()}`);
  const payload = await res.json() as { data?: ResendContact[] };
  return payload.data ?? [];
}

async function deleteContact(audienceId: string, contactId: string): Promise<void> {
  const res = await fetch(`https://api.resend.com/audiences/${audienceId}/contacts/${contactId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${RESEND_KEY}` },
  });
  if (!res.ok && res.status !== 404) {
    throw new Error(`Delete failed (${contactId}): ${res.status} ${await res.text()}`);
  }
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("═══════════════════════════════════════════════════════");
  console.log("  RealEST — Resend Test Contact Scrubber");
  console.log("═══════════════════════════════════════════════════════");
  if (DRY_RUN) console.log("⚠️   DRY RUN — nothing will be deleted\n");

  let totalDeleted = 0;
  let totalKept    = 0;

  for (const { id: audienceId, name } of AUDIENCES) {
    console.log(`\n📋 ${name} (${audienceId})`);

    const contacts = await listContacts(audienceId);
    console.log(`   ${contacts.length} contacts found`);

    const toDelete = contacts.filter(c => isTestEmail(c.email));
    const toKeep   = contacts.filter(c => !isTestEmail(c.email));

    console.log(`   ${toDelete.length} to DELETE  |  ${toKeep.length} to KEEP`);

    if (toDelete.length > 0) {
      console.log("\n   Contacts to be deleted:");
      toDelete.forEach(c => {
        console.log(`     🗑️  ${c.email.padEnd(45)} (${c.first_name ?? ""} ${c.last_name ?? ""})`);
      });
    }

    if (!DRY_RUN && toDelete.length > 0) {
      console.log("\n   Deleting...");
      for (let i = 0; i < toDelete.length; i++) {
        const c = toDelete[i];
        await deleteContact(audienceId, c.id);
        process.stdout.write(`     Progress: ${i + 1}/${toDelete.length}\r`);
        if (i < toDelete.length - 1) await sleep(400); // stay under rate limit
      }
      process.stdout.write("\n");
      console.log(`   ✅ Deleted ${toDelete.length} contacts from ${name}`);
    }

    totalDeleted += toDelete.length;
    totalKept    += toKeep.length;
  }

  console.log("\n═══════════════════════════════════════════════════════");
  console.log(`  Summary: ${totalDeleted} deleted, ${totalKept} kept`);
  if (DRY_RUN) console.log("  Run without --dry-run to apply changes.");
  console.log("═══════════════════════════════════════════════════════");
}

main().catch(err => { console.error("❌ Fatal:", err); process.exit(1); });
