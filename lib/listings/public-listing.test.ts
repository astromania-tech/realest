import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { isPublicListing, propertyForViewer, publicListingPath, publicPersonCard } from "@/lib/listings/public-listing";

test("an agent listing links to /listing and an owner listing links to /property", () => {
  assert.equal(publicListingPath("p1", "agent"), "/listing/p1");
  assert.equal(publicListingPath("p1", "owner"), "/property/p1");
  assert.equal(publicListingPath("p1", null), "/property/p1");
});

test("a public listing is live and verified", () => {
  assert.equal(isPublicListing({ status: "live", verification_status: "verified" }), true);
  assert.equal(isPublicListing({ status: "live", verification_status: "pending" }), false);
  assert.equal(isPublicListing({ status: "draft", verification_status: "verified" }), false);
});

test("a public viewer does not receive documents, inquiries, email, or phone", () => {
  const viewed = propertyForViewer(
    {
      id: "p1",
      property_documents: [{ id: "d1" }],
      inquiries: [{ message: "private" }],
      owners: { profiles: { id: "u1", full_name: "Ada", avatar_url: null, phone: "0803", email: "ada@example.com" } },
    },
    "public",
  );
  assert.equal("property_documents" in viewed, false);
  assert.equal("inquiries" in viewed, false);
  assert.equal(viewed.owners?.profiles?.phone, undefined);
  assert.equal(viewed.owners?.profiles?.email, undefined);
  assert.equal(viewed.owners?.profiles?.full_name, "Ada");
  assert.deepEqual(publicPersonCard({ id: "u1", full_name: "Ada", avatar_url: null }), {
    id: "u1",
    full_name: "Ada",
    avatar_url: null,
  });
});

test("public routes share the live and verified rule", () => {
  const list = readFileSync("app/api/properties/route.ts", "utf8");
  const detail = readFileSync("app/api/properties/[id]/route.ts", "utf8");
  const pub = readFileSync("app/api/properties/[id]/public/route.ts", "utf8");
  const guest = readFileSync("app/api/inquiries/guest/route.ts", "utf8");
  const search = readFileSync("app/api/search/properties/route.ts", "utf8");
  for (const source of [list, detail, pub, guest, search]) {
    assert.match(source, /publicListingWhere|isPublicListing/);
  }
  assert.equal(pub.includes("email: property.owners"), false);
  assert.equal(list.includes("phone: true"), false);
  assert.equal(search.includes("phone: true"), false);
  assert.doesNotMatch(search, /phone:\s*p\.owners/);
});

test("public agent APIs do not select or return email or phone", () => {
  const list = readFileSync("app/api/agents/route.ts", "utf8");
  const detail = readFileSync("app/api/agents/[id]/route.ts", "utf8");
  for (const source of [list, detail]) {
    assert.match(source, /publicPersonCard/);
    assert.doesNotMatch(source, /email:\s*true/);
    assert.doesNotMatch(source, /phone:\s*true/);
  }
  assert.doesNotMatch(detail, /email:\s*agentRow\.profiles\.email/);
  assert.doesNotMatch(detail, /phone:\s*agentRow\.profiles\.phone/);
});
