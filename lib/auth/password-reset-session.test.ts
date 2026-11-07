/**
 * Password reset / invite setup must read tokens from the URL hash.
 * Admin generateLink recovery URLs land as #access_token=...&refresh_token=...
 */
/// <reference types="node" />
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { authParamsFromUrl } from "../auth.ts";

test("authParamsFromUrl reads access_token from the hash fragment", () => {
  const params = authParamsFromUrl(
    new URLSearchParams(),
    "#access_token=atk&refresh_token=rtk&type=recovery",
  );
  assert.equal(params.get("access_token"), "atk");
  assert.equal(params.get("refresh_token"), "rtk");
  assert.equal(params.get("type"), "recovery");
});

test("authParamsFromUrl prefers query values over hash duplicates", () => {
  const params = authParamsFromUrl(
    new URLSearchParams("code=from-query"),
    "#code=from-hash&access_token=atk",
  );
  assert.equal(params.get("code"), "from-query");
  assert.equal(params.get("access_token"), "atk");
});

test("authParamsFromUrl tolerates missing hash", () => {
  const params = authParamsFromUrl(new URLSearchParams("code=abc"));
  assert.equal(params.get("code"), "abc");
  assert.equal(params.get("access_token"), null);
});

test("authParamsFromUrl reads token_hash from query for recovery links", () => {
  const params = authParamsFromUrl(
    new URLSearchParams("token_hash=thash&type=recovery"),
  );
  assert.equal(params.get("token_hash"), "thash");
  assert.equal(params.get("type"), "recovery");
});

test("handlePasswordResetSession source verifies token_hash before PKCE code", () => {
  const source = readFileSync(new URL("../auth.ts", import.meta.url), "utf8");
  const tokenHashIdx = source.indexOf('params.get("token_hash")');
  const codeIdx = source.indexOf(
    "// Check for PKCE code parameter (modern Supabase flow)",
  );
  assert.ok(tokenHashIdx > 0, "must read token_hash");
  assert.ok(codeIdx > tokenHashIdx, "token_hash path must run before PKCE code");
  assert.match(source, /token_hash:\s*tokenHash/);
});
