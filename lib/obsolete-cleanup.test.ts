/**
 * Confirmed-dead modules must stay gone (no dependents when removed).
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

test("orphan UI and pattern files stay deleted", () => {
  for (const path of [
    "components/patterns/navigation.tsx",
    "components/untitledui/InfrastructureIndicators.tsx",
    "components/realest/location/LocationPin.tsx",
    "components/property/PropertyGallery.tsx",
    "components/property/ContactOwner.tsx",
    "components/property/PropertyDocuments.tsx",
    "lib/hooks/useToast.ts",
    "lib/hooks/index.ts",
    "components/ui/chart.tsx",
    "components/ui/resizable.tsx",
    "components/ui/sonner.tsx",
    "components/ui/toast.tsx",
    "components/ui/toaster.tsx",
  ]) {
    assert.equal(existsSync(path), false, path);
  }
});

test("dead auth helpers and deprecated reviewer path wrapper stay removed", () => {
  const auth = readFileSync("lib/auth.ts", "utf8");
  const roles = readFileSync("lib/auth/roles.ts", "utf8");
  assert.doesNotMatch(auth, /export async function sendPasswordResetEmail/);
  assert.doesNotMatch(auth, /export async function resetPassword/);
  assert.doesNotMatch(auth, /export async function sendOTP/);
  assert.doesNotMatch(auth, /export async function verifyEmail/);
  assert.doesNotMatch(auth, /export async function isAuthenticated/);
  assert.doesNotMatch(auth, /export function isValidEmail/);
  assert.doesNotMatch(auth, /export function getSessionTimeout/);
  assert.doesNotMatch(roles, /isReviewerAllowedPath/);
  assert.doesNotMatch(roles, /REVIEWER_HIDDEN_PROFILE_FIELDS/);
  assert.doesNotMatch(roles, /SENSITIVE_ADMIN_CAPABILITIES/);
});
