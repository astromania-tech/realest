import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { accountSignInClosed } from "./account-closed.ts";
import { isStaffAllowedPath } from "./roles.ts";

test("only a banned account is closed at sign-in", () => {
  assert.equal(accountSignInClosed(null), false);
  assert.equal(accountSignInClosed({}), false);
  assert.equal(accountSignInClosed({ deleted_at: null }), false);
  assert.equal(accountSignInClosed({ deleted_at: new Date() }), true);
  assert.equal(accountSignInClosed({ deleted_at: "2026-11-02T00:00:00.000Z" }), true);
});

test("the duplicate list is gated before it reads properties", () => {
  assert.equal(isStaffAllowedPath("team_member", "/admin/validation/duplicates"), false);
  assert.equal(isStaffAllowedPath("reviewer", "/admin/validation/duplicates"), true);
  const list = readFileSync("app/(dashboard)/admin/validation/duplicates/page.tsx", "utf8");
  const detail = readFileSync("app/(dashboard)/admin/validation/duplicates/[id]/page.tsx", "utf8");
  const listGate = list.indexOf('requireStaffPage("/admin/validation/duplicates")');
  const listQuery = list.indexOf("prisma.properties");
  assert.ok(listGate >= 0 && listGate < listQuery);
  const detailGate = detail.indexOf("requireStaffPage(`/admin/validation/duplicates/${id}`)");
  const detailQuery = detail.indexOf("prisma.properties");
  assert.ok(detailGate >= 0 && detailGate < detailQuery);
});

test("my visits pages the full assignment set", () => {
  const store = readFileSync("lib/trust/field-team-store.ts", "utf8");
  const fn = store.slice(store.indexOf("export async function listMyFieldAssignments"));
  assert.match(fn, /count\(distinct p\.id\)/);
  assert.match(fn, /offset \$\{offset\}/);
  assert.doesNotMatch(fn, /limit 50/);
  const page = readFileSync("app/(dashboard)/admin/validation/my-visits/page.tsx", "utf8");
  assert.doesNotMatch(page, /listMyVisits/);
});

test("sign-in clears a banned session before the staff shell", () => {
  const middleware = readFileSync("lib/supabase/middleware.ts", "utf8");
  const closed = middleware.indexOf("accountSignInClosed");
  const guest = middleware.indexOf("isGuestOnlyRoute");
  assert.ok(closed >= 0 && closed < guest);
  assert.match(middleware, /auth\.signOut/);
  const login = readFileSync("app/(auth)/login/LoginClient.tsx", "utf8");
  assert.match(login, /accountSignInClosed/);
  assert.match(login, /signOut/);
});
