import assert from "node:assert/strict";
import test from "node:test";
import { DUPLICATE_RADIUS_KM, loadDuplicateCandidates } from "@/lib/trust/candidates";

test("pin candidates use the 50 metre PostGIS radius", async () => {
  assert.equal(DUPLICATE_RADIUS_KM, 0.05);
  const calls: Array<{ radiusKm: number; excludePropertyId?: string }> = [];
  const loaded = await loadDuplicateCandidates({
    propertyId: "11111111-1111-1111-1111-111111111111",
    latitude: 6.45,
    longitude: 3.4,
    withinRadius: async (params) => {
      calls.push({ radiusKm: params.radiusKm, excludePropertyId: params.excludePropertyId });
      return [
        { id: "22222222-2222-2222-2222-222222222222" },
        { id: "11111111-1111-1111-1111-111111111111" },
      ];
    },
    loadByIds: async (ids) => ids.map((id) => ({ id, address: "Plot 4" })),
  });
  assert.equal(calls[0]?.radiusKm, 0.05);
  assert.equal(calls[0]?.excludePropertyId, "11111111-1111-1111-1111-111111111111");
  assert.deepEqual(loaded.map((row) => row.id), ["22222222-2222-2222-2222-222222222222"]);
});

test("a listing without a pin has no duplicate candidates", async () => {
  let called = false;
  const loaded = await loadDuplicateCandidates({
    propertyId: "11111111-1111-1111-1111-111111111111",
    latitude: null,
    longitude: 3.4,
    withinRadius: async () => {
      called = true;
      return [];
    },
    loadByIds: async () => [{ id: "nope" }],
  });
  assert.equal(called, false);
  assert.deepEqual(loaded, []);
});
