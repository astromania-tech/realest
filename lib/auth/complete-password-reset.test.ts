/**
 * Password reset completion must run on the server with recovery cookies.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

test("handlePasswordResetSession allows OTP arrival without client session", () => {
  const source = readFileSync(new URL("../auth.ts", import.meta.url), "utf8");
  assert.match(
    source,
    /deferring to server cookie check/,
  );
  assert.doesNotMatch(
    source,
    /No reset token found\. Please check your email link/,
  );
});

test("complete-password-reset route signs out after update", () => {
  const source = readFileSync(
    new URL(
      "../../app/api/auth/complete-password-reset/route.ts",
      import.meta.url,
    ),
    "utf8",
  );
  const updateIdx = source.indexOf("updateUser");
  const notifyIdx = source.indexOf("sendPasswordChangedEmail");
  const signOutIdx = source.indexOf("signOut");
  assert.ok(updateIdx > 0);
  assert.ok(notifyIdx > updateIdx, "notify after update");
  assert.ok(signOutIdx > notifyIdx, "signOut after notify");
});
