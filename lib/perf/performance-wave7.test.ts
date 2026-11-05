/**
 * Performance wave 7 contracts:
 * - admin ML/vetting queues use _count + capped per_page
 * - admin CMS waitlist/users pages bounded Prisma selects
 * - notifications take capped and counts parallel
 * - property reviews aggregate parallel with list/count
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("admin ML validation queue caps page size and uses document/media counts", () => {
  const source = readFileSync("app/api/admin/validation/ml/route.ts", "utf8");
  assert.match(source, /Math\.min\(50/);
  assert.match(source, /_count:\s*\{\s*select:\s*\{\s*property_documents:\s*true/);
  assert.doesNotMatch(source, /include:\s*\{[\s\S]*property_documents:\s*true/);
});

test("admin vetting queue caps page size and uses document/media counts", () => {
  const source = readFileSync(
    "app/api/admin/validation/vetting/route.ts",
    "utf8",
  );
  assert.match(source, /Math\.min\(50/);
  assert.match(source, /_count:\s*\{\s*select:\s*\{\s*property_documents:\s*true/);
  assert.doesNotMatch(source, /include:\s*\{[\s\S]*property_documents:\s*true/);
});

test("admin CMS waitlist page uses bounded Prisma select", () => {
  const source = readFileSync(
    "app/(dashboard)/admin/cms/waitlist/page.tsx",
    "utf8",
  );
  assert.match(source, /prisma\.waitlist\.findMany/);
  assert.match(source, /take:\s*100/);
  assert.doesNotMatch(source, /\.select\(["']\*["']\)/);
  assert.match(source, /Promise\.all/);
});

test("admin users pages use bounded Prisma selects and counts", () => {
  const users = readFileSync("app/(dashboard)/admin/users/page.tsx", "utf8");
  const cms = readFileSync("app/(dashboard)/admin/cms/users/page.tsx", "utf8");
  for (const source of [users, cms]) {
    assert.match(source, /prisma\.users\.findMany/);
    assert.match(source, /take:\s*50/);
    assert.doesNotMatch(source, /\.select\(["']\*["']\)/);
    assert.match(source, /Promise\.all/);
  }
});

test("notifications GET caps take and parallelizes counts", () => {
  const source = readFileSync("app/api/notifications/route.ts", "utf8");
  assert.match(source, /Math\.min\(\s*50/);
  assert.match(source, /Promise\.all\([\s\S]*notifications\.count/);
  assert.doesNotMatch(
    source,
    /const total = await prisma\.notifications\.count/,
  );
});

test("property reviews aggregate runs with list and count", () => {
  const source = readFileSync(
    "app/api/properties/[id]/reviews/route.ts",
    "utf8",
  );
  assert.match(
    source,
    /Promise\.all\(\[\s*\n?\s*prisma\.reviews\.findMany/,
  );
  assert.match(source, /prisma\.reviews\.aggregate/);
  assert.doesNotMatch(
    source,
    /const ratingAgg = await prisma\.reviews\.aggregate/,
  );
});
