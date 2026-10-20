import assert from "node:assert/strict";
import test from "node:test";

function activeHref(currentPath: string, hrefs: string[]): string | undefined {
  const matchesPath = (candidate: string) => {
    if (candidate === "/agent" || candidate === "/owner" || candidate === "/profile") {
      return currentPath === candidate;
    }
    return currentPath === candidate || currentPath.startsWith(`${candidate}/`);
  };
  return hrefs.filter(matchesPath).sort((a, b) => b.length - a.length)[0];
}

const agentHrefs = [
  "/agent",
  "/agent/properties",
  "/agent/properties/new",
  "/agent/identity",
  "/setting",
  "/setting/security",
];

test("agent dashboard is only active on the workspace root", () => {
  assert.equal(activeHref("/agent", agentHrefs), "/agent");
  assert.equal(activeHref("/agent/properties", agentHrefs), "/agent/properties");
  assert.notEqual(activeHref("/agent/properties/new", agentHrefs), "/agent");
});

test("add property wins over my listings on the new listing path", () => {
  assert.equal(activeHref("/agent/properties/new", agentHrefs), "/agent/properties/new");
  assert.notEqual(activeHref("/agent/properties/new", agentHrefs), "/agent/properties");
});

test("identity stays alone on the identity path", () => {
  assert.equal(activeHref("/agent/identity", agentHrefs), "/agent/identity");
});
