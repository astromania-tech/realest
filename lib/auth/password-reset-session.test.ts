/**
 * Password reset / invite setup must read tokens from the URL hash.
 * Admin generateLink recovery URLs land as #access_token=...&refresh_token=...
 */
/// <reference types="node" />
import assert from "node:assert/strict";
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
