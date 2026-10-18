import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { isRouteAccessible } from "@/lib/appMode";

function createCallIsAfterKyc(source: string) {
  const kycAt = source.indexOf("assertListingKyc");
  const createAt = source.indexOf("prisma.properties.create");
  return kycAt >= 0 && createAt > kycAt;
}

test("both listing create routes check Youverify before saving a property", () => {
  const properties = readFileSync("app/api/properties/route.ts", "utf8");
  const dashboard = readFileSync("app/api/dashboard/listings/route.ts", "utf8");
  assert.equal(createCallIsAfterKyc(properties), true);
  assert.equal(createCallIsAfterKyc(dashboard), true);
  assert.match(properties, /from "@\/lib\/kyc\/store"/);
  assert.match(dashboard, /from '@\/lib\/kyc\/store'/);
});

test("the Youverify webhook stays reachable while coming-soon locks the submit route", () => {
  const previousMode = process.env.NEXT_PUBLIC_APP_MODE;
  const previousRelease = process.env.NEXT_PUBLIC_RELEASE_DATE;
  process.env.NEXT_PUBLIC_APP_MODE = "coming-soon";
  delete process.env.NEXT_PUBLIC_RELEASE_DATE;
  try {
    assert.equal(isRouteAccessible("/api/webhooks/youverify"), true);
    assert.equal(isRouteAccessible("/api/kyc/youverify"), false);
  } finally {
    if (previousMode === undefined) delete process.env.NEXT_PUBLIC_APP_MODE;
    else process.env.NEXT_PUBLIC_APP_MODE = previousMode;
    if (previousRelease === undefined) delete process.env.NEXT_PUBLIC_RELEASE_DATE;
    else process.env.NEXT_PUBLIC_RELEASE_DATE = previousRelease;
  }
});
