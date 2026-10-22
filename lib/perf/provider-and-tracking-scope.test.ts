/// <reference types="node" />
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

test("root layout keeps AuthProvider and drops UserProvider + third-party scripts", () => {
  const root = readFileSync("app/layout.tsx", "utf8");
  assert.match(root, /AuthProvider/);
  assert.doesNotMatch(root, /UserProvider/);
  assert.doesNotMatch(root, /hs-script-loader/);
  assert.doesNotMatch(root, /fbq\('init'/);
  assert.doesNotMatch(root, /ze-snippet/);
});

test("marketing tracking scripts live in the shared marketing component", () => {
  const scripts = readFileSync(
    "components/marketing/MarketingTrackingScripts.tsx",
    "utf8",
  );
  assert.match(scripts, /hs-script-loader/);
  assert.match(scripts, /fbq\('init'/);
  assert.match(scripts, /ze-snippet/);
});

test("marketing, home, and email-links mount tracking; dashboard does not", () => {
  const marketing = readFileSync("app/(marketing)/layout.tsx", "utf8");
  const home = readFileSync("app/page.tsx", "utf8");
  const emailLinks = readFileSync("app/(email-links)/layout.tsx", "utf8");
  const dashboard = readFileSync("app/(dashboard)/layout.tsx", "utf8");
  const root = readFileSync("app/layout.tsx", "utf8");

  assert.match(marketing, /MarketingTrackingScripts/);
  assert.match(home, /MarketingTrackingScripts/);
  assert.match(emailLinks, /MarketingTrackingScripts/);
  assert.doesNotMatch(dashboard, /MarketingTrackingScripts/);
  assert.doesNotMatch(root, /MarketingTrackingScripts/);
});

test("ProfileDropdown tolerates missing UserProvider via useOptionalUser", () => {
  const dropdown = readFileSync("components/realest/ProfileDropdown.tsx", "utf8");
  const header = readFileSync("components/layout/Header.tsx", "utf8");
  assert.match(dropdown, /useOptionalUser/);
  assert.match(dropdown, /fallbackRole/);
  assert.match(header, /fallbackRole=\{role\}/);
});

test("listCaseQueue pushes filter and search into SQL", () => {
  const load = readFileSync("lib/trust/load-case-view.ts", "utf8");
  assert.match(load, /caseQueueFilterSql/);
  assert.match(load, /caseQueueSearchSql/);
  assert.doesNotMatch(load, /matchesCaseQueueFilter/);
  assert.match(load, /loadCaseQueueMetrics/);
});
