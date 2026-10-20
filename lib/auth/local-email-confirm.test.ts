import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { alreadyRegisteredEmail, localEmailConfirmAllowed } from "@/lib/auth/local-email-confirm";

test("local signup confirms email only on this PC against local Supabase", () => {
  assert.equal(localEmailConfirmAllowed({
    nodeEnv: "development",
    supabaseUrl: "http://127.0.0.1:54321",
  }), true);
  assert.equal(localEmailConfirmAllowed({
    nodeEnv: "development",
    supabaseUrl: "http://localhost:54321",
  }), true);
  assert.equal(localEmailConfirmAllowed({
    nodeEnv: "production",
    supabaseUrl: "http://127.0.0.1:54321",
  }), false);
  assert.equal(localEmailConfirmAllowed({
    nodeEnv: "development",
    supabaseUrl: "https://example.supabase.co",
  }), false);
  assert.equal(localEmailConfirmAllowed({
    nodeEnv: "development",
    supabaseUrl: "",
  }), false);
});

test("an existing local account can be confirmed when signup says it is already registered", () => {
  assert.equal(alreadyRegisteredEmail("A user with this email address has already been registered"), true);
  assert.equal(alreadyRegisteredEmail("Invalid password"), false);
});

test("the signup route confirms email only through the local guard", () => {
  const route = readFileSync("app/api/auth/signup/route.ts", "utf8");
  assert.match(route, /email_confirm: confirmLocally/);
  assert.match(route, /if \(confirmLocally\)/);
  assert.match(route, /if \(!localEmailConfirmAllowed\(\)\) return null/);
});
