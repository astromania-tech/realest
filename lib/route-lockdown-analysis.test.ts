import assert from "node:assert/strict";
import test from "node:test";
import {
  analyzeRouteLockdownResponse,
  isComingSoonHome,
  isLockdownBlocked,
} from "./route-lockdown-analysis.ts";

const NOT_FOUND_BODY = `
  <h1>404</h1>
  <h2>Page Not Found</h2>
  <p>Oops! The page you're looking for doesn't exist.</p>
`;

const COMING_SOON_BODY = `
  <h1>Nigeria's Most Trusted Real Estate Platform</h1>
  <h3>Get Ready for Launch</h3>
  <button>Join Waitlist</button>
  <span>Launch date coming soon!</span>
  <!-- Next.js payloads can embed not-found copy without being a 404 response -->
  <script>self.__next_f.push([1,"Page Not Found"])</script>
  <script>self.__next_f.push([1,"404"])</script>
`;

test("HTTP 200 is never lockdown-blocked", () => {
  assert.equal(isLockdownBlocked(200), false);
  assert.equal(isLockdownBlocked(404), true);
});

test("coming-soon home is detected even when body embeds Page Not Found", () => {
  assert.equal(isComingSoonHome(COMING_SOON_BODY, 200), true);
});

test("blocked routes pass only on HTTP 404", () => {
  const blocked = analyzeRouteLockdownResponse(
    { statusCode: 404, body: NOT_FOUND_BODY },
    "/login",
    true,
  );
  assert.equal(blocked.passed, true);
  assert.equal(blocked.actualBehavior, "BLOCKED");

  const leaked = analyzeRouteLockdownResponse(
    { statusCode: 200, body: COMING_SOON_BODY },
    "/login",
    true,
  );
  assert.equal(leaked.passed, false);
  assert.equal(leaked.isBlocked, false);
});

test("home passes on 200 even when body embeds Page Not Found", () => {
  const home = analyzeRouteLockdownResponse(
    { statusCode: 200, body: COMING_SOON_BODY },
    "/",
    false,
  );
  assert.equal(home.passed, true);
  assert.equal(home.isBlocked, false);
  assert.equal(home.isComingSoon, true);
  assert.equal(home.actualBehavior, "COMING_SOON");
});

test("home fails if status is 404", () => {
  const home = analyzeRouteLockdownResponse(
    { statusCode: 404, body: NOT_FOUND_BODY },
    "/",
    false,
  );
  assert.equal(home.passed, false);
  assert.equal(home.actualBehavior, "BLOCKED");
});

test("/not-found allowlisted route passes when intentional 404 page works", () => {
  const nf = analyzeRouteLockdownResponse(
    { statusCode: 404, body: NOT_FOUND_BODY },
    "/not-found",
    false,
  );
  assert.equal(nf.passed, true);
  assert.equal(nf.actualBehavior, "NOT_FOUND_OK");
});

test("/not-found fails when it does not serve the not-found page", () => {
  const nf = analyzeRouteLockdownResponse(
    { statusCode: 200, body: COMING_SOON_BODY },
    "/not-found",
    false,
  );
  assert.equal(nf.passed, false);
});

test("favicon passes on 200", () => {
  const fav = analyzeRouteLockdownResponse(
    { statusCode: 200, body: "" },
    "/favicon.ico",
    false,
  );
  assert.equal(fav.passed, true);
  assert.equal(fav.actualBehavior, "ACCESSIBLE");
});
