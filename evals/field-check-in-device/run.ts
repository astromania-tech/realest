/**
 * Deterministic eval: phone check-in stays device GPS + camera capture (no typed coords).
 *
 *   npx tsx evals/field-check-in-device/run.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { deviceCheckInAllowed } from "../../lib/trust/visit.ts";

const cases: Array<{ id: string; run: () => boolean }> = [
  {
    id: "typed-coordinates-refused",
    run: () => deviceCheckInAllowed({ locationSource: "typed", accuracyMeters: 8 }).ok === false,
  },
  {
    id: "device-gps-with-accuracy-allowed",
    run: () => deviceCheckInAllowed({ locationSource: "device", accuracyMeters: 12 }).ok === true,
  },
  {
    id: "field-checkin-uses-geolocation-api",
    run: () => {
      const source = readFileSync("components/realest/validation/FieldCheckIn.tsx", "utf8");
      return (
        source.includes("navigator.geolocation") &&
        source.includes("getCurrentPosition") &&
        source.includes('location_source: "device"') &&
        source.includes("enableHighAccuracy: true")
      );
    },
  },
  {
    id: "field-checkin-uses-environment-camera",
    run: () => {
      const source = readFileSync("components/realest/validation/FieldCheckIn.tsx", "utf8");
      return (
        source.includes('capture="environment"') &&
        source.includes('accept="image/jpeg,image/png,image/webp"') &&
        source.includes("type=\"file\"")
      );
    },
  },
  {
    id: "no-typed-lat-lng-inputs",
    run: () => {
      const source = readFileSync("components/realest/validation/FieldCheckIn.tsx", "utf8");
      return (
        !source.includes('name="latitude"') &&
        !source.includes('name="longitude"') &&
        !source.includes('type="number"')
      );
    },
  },
  {
    id: "success-returns-to-my-visits-not-legacy-vetting",
    run: () => {
      const source = readFileSync("components/realest/validation/FieldCheckIn.tsx", "utf8");
      return (
        source.includes('"/admin/validation/my-visits"') &&
        !source.includes('"/admin/validation/vetting"')
      );
    },
  },
];

let failed = 0;
for (const item of cases) {
  const passed = item.run();
  if (!passed) {
    failed += 1;
    console.error(`FAIL ${item.id}`);
  } else {
    console.log(`PASS ${item.id}`);
  }
}

assert.equal(failed, 0, `${failed} field-check-in-device eval case(s) failed`);
console.log(`field-check-in-device eval: ${cases.length - failed}/${cases.length} passed`);
