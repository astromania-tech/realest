import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { verificationDestination } from "./verification-destination.ts";

test("a buyer lands on their profile", () => {
  assert.equal(verificationDestination({ id: "u1", user_metadata: { user_type: "user" } }), "/profile");
});

test("an owner or agent lands on onboarding", () => {
  assert.equal(verificationDestination({ id: "u1", user_metadata: { user_type: "owner" } }), "/onboarding");
  assert.equal(verificationDestination({ id: "u1", app_metadata: { role: "agent" } }), "/onboarding");
});

test("a non-string role is ignored", () => {
  assert.equal(
    verificationDestination({ id: "u1", app_metadata: { role: 1 } }),
    "/login?verified=true",
  );
});

test("an admin lands on the admin home", () => {
  assert.equal(verificationDestination({ id: "u1", app_metadata: { role: "admin" } }), "/admin");
});

test("a missing account goes to login", () => {
  assert.equal(verificationDestination(null), "/login?verified=true");
  assert.equal(verificationDestination({ id: "u1" }), "/login?verified=true");
});

test("the verify screen uses the logout modal shell", () => {
  const modal = readFileSync(new URL("../../components/shared/VerifiedAccountModal.tsx", import.meta.url), "utf8");
  const logout = readFileSync(new URL("../../components/shared/LogoutModal.tsx", import.meta.url), "utf8");
  const verify = readFileSync(new URL("../../app/(auth)/verify/VerifyClient.tsx", import.meta.url), "utf8");
  assert.match(modal, /Account verified/);
  assert.match(modal, /bg-background\/20 backdrop-blur-xs/);
  assert.match(logout, /bg-background\/20 backdrop-blur-xs/);
  assert.match(verify, /VerifiedAccountModal/);
  assert.match(verify, /verificationDestination/);
  assert.match(verify, /exchangeCodeForSession/);
  assert.match(verify, /session could not be loaded/);
  assert.match(verify, /No verification token found/);
});
