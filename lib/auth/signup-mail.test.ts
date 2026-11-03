import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { duplicateSignupMessage, signupVerifyRedirect, verificationEmailLink } from "./signup-mail.ts";

const hosted = { VERCEL_ENV: "production", VERCEL_PROJECT_PRODUCTION_URL: "app.example.com" };

test("site url wins over the app url", () => {
  assert.equal(
    signupVerifyRedirect({
      NEXT_PUBLIC_SITE_URL: "https://site.example.com/",
      NEXT_PUBLIC_APP_URL: "https://app.example.com",
    }),
    "https://site.example.com/verify",
  );
});

test("app url is used when the site url is empty", () => {
  assert.equal(
    signupVerifyRedirect({ NEXT_PUBLIC_APP_URL: "https://dev.example.com" }),
    "https://dev.example.com/verify",
  );
});

test("preview send uses the preview host", () => {
  assert.equal(
    signupVerifyRedirect({
      VERCEL_ENV: "preview",
      NEXT_PUBLIC_APP_URL: "http://localhost:3000",
      VERCEL_URL: "realest-git-preview.vercel.app",
      VERCEL_PROJECT_PRODUCTION_URL: "realest.ng",
    }),
    "https://realest-git-preview.vercel.app/verify",
  );
});

test("hosted send ignores a localhost public url", () => {
  assert.equal(
    signupVerifyRedirect({
      ...hosted,
      NEXT_PUBLIC_APP_URL: "http://localhost:3000",
      NEXT_PUBLIC_SITE_URL: "http://127.0.0.1:3000",
    }),
    "https://app.example.com/verify",
  );
});

test("local send keeps the loopback redirect", () => {
  assert.equal(
    signupVerifyRedirect({ NEXT_PUBLIC_SITE_URL: "http://localhost:3000" }),
    "http://127.0.0.1:3000/verify",
  );
});

test("hosted send with no public host throws", () => {
  assert.throws(() => signupVerifyRedirect({ VERCEL_ENV: "production" }), /NEXT_PUBLIC_SITE_URL is not set/);
  assert.throws(() => signupVerifyRedirect({}), /NEXT_PUBLIC_SITE_URL is not set/);
});

test("redirect_to on the supabase link is rewritten off localhost", () => {
  const link = verificationEmailLink(
    "https://project.supabase.co/auth/v1/verify?token=abc&type=signup&redirect_to=http%3A%2F%2Flocalhost%3A3000%2Fverify",
    hosted,
  );
  const url = new URL(link);
  assert.equal(url.host, "project.supabase.co");
  assert.equal(url.searchParams.get("redirect_to"), "https://app.example.com/verify");
  assert.equal(url.searchParams.get("token"), "abc");
});

test("a localhost supabase verify link uses the public api host", () => {
  const link = verificationEmailLink(
    "http://127.0.0.1:54321/auth/v1/verify?token=abc&type=signup&redirect_to=http%3A%2F%2Flocalhost%3A3000%2Fverify",
    { ...hosted, NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co" },
  );
  const url = new URL(link);
  assert.equal(url.host, "project.supabase.co");
  assert.equal(url.pathname, "/auth/v1/verify");
  assert.equal(url.searchParams.get("redirect_to"), "https://app.example.com/verify");
});

test("a localhost site link is moved onto the public site", () => {
  const link = verificationEmailLink("http://localhost:3000/verify?token=abc&type=signup", hosted);
  const url = new URL(link);
  assert.equal(url.origin, "https://app.example.com");
  assert.equal(url.searchParams.get("token"), "abc");
});

test("a local send keeps a loopback link", () => {
  const link = verificationEmailLink(
    "http://localhost:54321/auth/v1/verify?token=abc&type=signup&redirect_to=http%3A%2F%2Flocalhost%3A3000%2Fverify",
    { NEXT_PUBLIC_SITE_URL: "http://localhost:3000" },
  );
  const url = new URL(link);
  assert.equal(url.hostname, "127.0.0.1");
  assert.equal(url.searchParams.get("redirect_to"), "http://127.0.0.1:3000/verify");
});

test("an existing account is not treated as a fresh signup", () => {
  assert.match(duplicateSignupMessage({ code: "email_exists" }) || "", /already exists/);
  assert.equal(duplicateSignupMessage({ message: "Invalid login" }), null);
});

test("signup route does not fall back to localhost", () => {
  const route = readFileSync(new URL("../../app/api/auth/signup/route.ts", import.meta.url), "utf8");
  assert.match(route, /signupVerifyRedirect/);
  assert.match(route, /verificationEmailLink/);
  assert.match(route, /type:\s*['"]magiclink['"]/);
  assert.match(route, /sendVerificationEmail/);
  assert.match(route, /emailSent:\s*false/);
  assert.doesNotMatch(route, /linkError\?\.message/);
  assert.doesNotMatch(route, /admin\.createUser/);
  assert.doesNotMatch(route, /localhost/);
});
