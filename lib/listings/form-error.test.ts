import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { LISTING_KYC_ERROR } from "@/lib/kyc/gate";
import { listingFormError, listingFormErrorTitle } from "@/lib/listings/form-error";

test("a refused listing shows the server message instead of throwing", () => {
  assert.equal(
    listingFormError(false, { error: LISTING_KYC_ERROR }, "Failed to save property"),
    LISTING_KYC_ERROR,
  );
  assert.equal(listingFormErrorTitle(LISTING_KYC_ERROR), "Identity approval required");
  assert.equal(listingFormError(false, {}, "Failed to save property"), "Failed to save property");
  assert.equal(listingFormError(true, { error: LISTING_KYC_ERROR }, "Failed to save property"), null);
});

test("the property form opens an error dialog and does not throw the save response", () => {
  const form = readFileSync("components/agent/PropertyForm.tsx", "utf8");
  assert.match(form, /listingFormError\(/);
  assert.match(form, /role="alertdialog"/);
  assert.doesNotMatch(form, /throw new Error\(result\.error/);
  assert.doesNotMatch(form, /console\.error\(err\)/);
});
