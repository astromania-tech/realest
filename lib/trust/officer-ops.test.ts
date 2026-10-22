/**
 * Officer ops: state/LGA match, load ranking, auto-recommend free officers.
 */
/// <reference types="node" />
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  MAX_OPEN_VISITS_SOFT,
  officerGeoAllowed,
  officerGeoMatch,
  pickAutoRecommendedOfficerIds,
  placesEqual,
  rankOfficersForProperty,
  readStaffOpsLocation,
  staffOpsLocationInputAllowed,
} from "./officer-ops.ts";

test("placesEqual ignores case and extra spaces", () => {
  assert.equal(placesEqual("Lagos", "lagos"), true);
  assert.equal(placesEqual("  Ikeja ", "ikeja"), true);
  assert.equal(placesEqual("Lagos", "Abuja"), false);
  assert.equal(placesEqual("", "Lagos"), false);
});

test("readStaffOpsLocation requires both ops_state and ops_lga columns", () => {
  assert.equal(readStaffOpsLocation(null), null);
  assert.equal(readStaffOpsLocation({ ops_state: "Lagos" }), null);
  const ops = readStaffOpsLocation({
    ops_state: "Lagos",
    ops_state_code: "LA",
    ops_lga: "Ikeja",
  });
  assert.deepEqual(ops, { state: "Lagos", stateCode: "LA", lga: "Ikeja" });
});


test("staffOpsLocationInputAllowed requires known Nigerian state and LGA", () => {
  const ok = staffOpsLocationInputAllowed({
    state: "Lagos",
    lga: "Ikeja",
    knownStateNames: ["Lagos", "Abuja"],
  });
  assert.equal(ok.ok, true);

  const badState = staffOpsLocationInputAllowed({
    state: "Narnia",
    lga: "Ikeja",
    knownStateNames: ["Lagos"],
  });
  assert.equal(badState.ok, false);

  const noLga = staffOpsLocationInputAllowed({
    state: "Lagos",
    lga: "x",
    knownStateNames: ["Lagos"],
  });
  assert.equal(noLga.ok, false);
});

test("officerGeoMatch prefers same LGA inside same state", () => {
  assert.equal(
    officerGeoMatch({
      propertyState: "Lagos",
      propertyCity: "Ikeja",
      officerState: "Lagos",
      officerLga: "Ikeja",
    }),
    "state_lga",
  );
  assert.equal(
    officerGeoMatch({
      propertyState: "Lagos",
      propertyCity: "Lekki",
      officerState: "Lagos",
      officerLga: "Ikeja",
    }),
    "state",
  );
  assert.equal(
    officerGeoMatch({
      propertyState: "Lagos",
      propertyCity: "Ikeja",
      officerState: "Abuja",
      officerLga: "Municipal",
    }),
    "none",
  );
});

test("officerGeoAllowed hard-blocks wrong state unless admin overrides", () => {
  const blocked = officerGeoAllowed({
    propertyState: "Lagos",
    officerState: "Abuja",
    actorRole: "supervisor",
    forceOverride: false,
  });
  assert.equal(blocked.ok, false);

  const adminForce = officerGeoAllowed({
    propertyState: "Lagos",
    officerState: "Abuja",
    actorRole: "admin",
    forceOverride: true,
  });
  assert.equal(adminForce.ok, true);

  const same = officerGeoAllowed({
    propertyState: "Lagos",
    officerState: "Lagos",
    actorRole: "reviewer",
    forceOverride: false,
  });
  assert.equal(same.ok, true);
});

test("rankOfficersForProperty recommends free same-state officers first", () => {
  const ranked = rankOfficersForProperty({
    propertyState: "Lagos",
    propertyCity: "Ikeja",
    officers: [
      {
        id: "busy-lagos",
        full_name: "Busy Lagos",
        role: "team_member",
        state: "Lagos",
        lga: "Ikeja",
        openVisits: MAX_OPEN_VISITS_SOFT,
      },
      {
        id: "abuja",
        full_name: "Abuja Officer",
        role: "team_member",
        state: "Abuja",
        lga: "Municipal",
        openVisits: 0,
      },
      {
        id: "free-lekki",
        full_name: "Free Lekki",
        role: "team_member",
        state: "Lagos",
        lga: "Eti-Osa",
        openVisits: 1,
      },
      {
        id: "free-ikeja",
        full_name: "Free Ikeja",
        role: "team_member",
        state: "Lagos",
        lga: "Ikeja",
        openVisits: 0,
      },
    ],
  });

  assert.equal(ranked[0]?.id, "free-ikeja");
  assert.equal(ranked[0]?.recommended, true);
  assert.equal(ranked[0]?.geoMatch, "state_lga");
  assert.equal(ranked[1]?.id, "free-lekki");
  assert.equal(ranked[1]?.recommended, true);
  assert.equal(ranked.find((row) => row.id === "busy-lagos")?.recommended, false);
  assert.equal(ranked.find((row) => row.id === "abuja")?.recommended, false);
  assert.deepEqual(pickAutoRecommendedOfficerIds(ranked, 2), ["free-ikeja", "free-lekki"]);
});
