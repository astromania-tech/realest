import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { submitSignupWithBestEffortWaitlist } from "./signup-waitlist-preflight.ts";

test("a non-2xx waitlist response does not block signup", async () => {
  let signupCalled = false;
  const result = await submitSignupWithBestEffortWaitlist({
    email: "agent@example.com",
    fetcher: async () => new Response("unavailable", { status: 503 }),
    signup: async () => {
      signupCalled = true;
      return "signup-result";
    },
  });

  assert.equal(result, "signup-result");
  assert.equal(signupCalled, true);
});

test("a network failure during the waitlist lookup does not block signup", async () => {
  let signupCalled = false;
  const result = await submitSignupWithBestEffortWaitlist({
    email: "agent@example.com",
    fetcher: async () => {
      throw new TypeError("Network request failed");
    },
    signup: async () => {
      signupCalled = true;
      return "signup-result";
    },
  });

  assert.equal(result, "signup-result");
  assert.equal(signupCalled, true);
});

test("malformed optional lookup data does not block signup", async () => {
  let signupCalled = false;
  const result = await submitSignupWithBestEffortWaitlist({
    email: "agent@example.com",
    fetcher: async () =>
      new Response("not-json", {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    signup: async () => {
      signupCalled = true;
      return "signup-result";
    },
  });

  assert.equal(result, "signup-result");
  assert.equal(signupCalled, true);
});

test("a successful lookup provides optional context before signup", async () => {
  const events: string[] = [];
  const result = await submitSignupWithBestEffortWaitlist({
    email: " Agent@Example.com ",
    fetcher: async (input) => {
      assert.equal(
        String(input),
        "/api/waitlist?email=Agent%40Example.com",
      );
      return Response.json({ exists: true, status: "invited" });
    },
    onWaitlistContext: (context) => {
      assert.equal(context.exists, true);
      events.push("context");
    },
    signup: async () => {
      events.push("signup");
      return "signup-result";
    },
  });

  assert.equal(result, "signup-result");
  assert.deepEqual(events, ["context", "signup"]);
});

test("the signup API resolves the authoritative role before Auth account creation", () => {
  const route = readFileSync("app/api/auth/signup/route.ts", "utf8");
  const roleLookupIndex = route.indexOf(
    "const signupRole = await resolveSignupRoleFromWaitlist(email, userType)",
  );
  const adminClientIndex = route.indexOf("const supabaseAdmin = createServiceClient()");
  const createUserIndex = route.indexOf("auth.admin.createUser");
  const catchIndex = route.indexOf("} catch (error: any)");

  assert.ok(roleLookupIndex >= 0);
  assert.ok(adminClientIndex > roleLookupIndex);
  assert.ok(createUserIndex > roleLookupIndex);
  assert.ok(catchIndex > roleLookupIndex);
  assert.match(route.slice(catchIndex), /status: 500/);
});
