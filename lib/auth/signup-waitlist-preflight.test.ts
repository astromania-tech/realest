import assert from "node:assert/strict";
import test from "node:test";
import { submitSignupWithBestEffortWaitlist } from "./signup-waitlist-preflight.ts";
import { resolveRoleThenCreate } from "./signup-waitlist-role.ts";

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
        "/api/waitlist?email=agent%40example.com",
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

test("a failed authoritative role lookup prevents Auth account creation", async () => {
  let createAccountCalled = false;

  await assert.rejects(
    resolveRoleThenCreate(
      async () => {
        throw new Error("waitlist role lookup failed");
      },
      async () => {
        createAccountCalled = true;
        return "created";
      },
    ),
    /waitlist role lookup failed/,
  );

  assert.equal(createAccountCalled, false);
});
