import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import {
  alreadyRegisteredEmail,
  duplicateSignupError,
  DUPLICATE_SIGNUP_MESSAGE,
  localEmailConfirmAllowed,
} from "@/lib/auth/local-email-confirm";

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

test("signup names an email Auth already has instead of treating it as a new account", () => {
  assert.equal(alreadyRegisteredEmail("A user with this email address has already been registered"), true);
  assert.equal(alreadyRegisteredEmail("Invalid password"), false);
  assert.equal(
    duplicateSignupError({ message: "A user with this email address has already been registered" }),
    DUPLICATE_SIGNUP_MESSAGE,
  );
  assert.equal(duplicateSignupError({ code: "email_exists" }), DUPLICATE_SIGNUP_MESSAGE);
  assert.equal(duplicateSignupError({ message: "Invalid password" }), null);
});

test("the signup route confirms a new local user and rejects a duplicate", () => {
  const route = readFileSync("app/api/auth/signup/route.ts", "utf8");
  assert.match(route, /email_confirm: true/);
  assert.match(route, /if \(confirmLocally\)/);
  assert.match(route, /if \(!localEmailConfirmAllowed\(\)\) return null/);
  assert.match(route, /duplicateSignupError/);
  assert.match(route, /status: 409/);
  assert.doesNotMatch(route, /confirmLocalAuthUser\(email,\s*password\)/);
  assert.doesNotMatch(route, /password \? \{ password \}/);
});
