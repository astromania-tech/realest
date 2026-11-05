import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { signupVerifyRedirect } from "@/lib/auth/signup-mail";

test("signup mail uses the public URL from the environment", () => {
  assert.equal(
    signupVerifyRedirect({
      NEXT_PUBLIC_SITE_URL: "https://dev.realest.ng/",
      NEXT_PUBLIC_APP_URL: "https://other.example",
    }),
    "https://dev.realest.ng/verify",
  );
  assert.equal(
    signupVerifyRedirect({ NEXT_PUBLIC_APP_URL: "https://dev.realest.ng" }),
    "https://dev.realest.ng/verify",
  );
  assert.equal(
    signupVerifyRedirect({ NEXT_PUBLIC_SITE_URL: "http://localhost:3000" }),
    "http://127.0.0.1:3000/verify",
  );
  assert.throws(() => signupVerifyRedirect({}), /NEXT_PUBLIC_SITE_URL is not set/);
  const source = readFileSync("lib/auth/signup-mail.ts", "utf8");
  assert.doesNotMatch(source, /realest\.ng/);
});

test("production signup creates the user with the signup link, then sends it", () => {
  const route = readFileSync("app/api/auth/signup/route.ts", "utf8");
  const post = route.slice(0, route.indexOf("export async function GET"));
  const hosted = post.split("localConfirmed: true")[1] ?? "";
  const beforeHosted = post.split("localConfirmed: true")[0] ?? "";
  const localStart = beforeHosted.indexOf("if (confirmLocally)");
  assert.ok(localStart >= 0);
  assert.match(beforeHosted.slice(localStart), /createUser/);
  assert.doesNotMatch(beforeHosted.slice(0, localStart), /createUser/);
  assert.match(hosted, /type: 'signup'/);
  assert.match(hosted, /sendVerificationEmail/);
  assert.match(hosted, /emailSent: sent\.success/);
  assert.doesNotMatch(hosted, /auth\.admin\.createUser/);
  assert.doesNotMatch(route, /REDACTED_NOT_REQUIRED/);
  assert.match(route, /type: 'magiclink'/);
  assert.match(route, /signupVerifyRedirect/);
});
