/**
 * A-01: PostGIS geo query validation (parameterized Prisma.sql + input bounds).
 */
/// <reference types="node" />
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  assertValidGeoQuery,
  InvalidGeoQueryError,
} from "./properties-within-radius.ts";

test("[A-01] geo query accepts valid lat/lng/radius", () => {
  assert.doesNotThrow(() =>
    assertValidGeoQuery({ lat: 6.5, lng: 3.4, radiusKm: 5 }),
  );
});

test("[A-01] geo query rejects non-finite or out-of-range numbers", () => {
  assert.throws(
    () => assertValidGeoQuery({ lat: Number.NaN, lng: 0, radiusKm: 1 }),
    InvalidGeoQueryError,
  );
  assert.throws(
    () => assertValidGeoQuery({ lat: 91, lng: 0, radiusKm: 1 }),
    InvalidGeoQueryError,
  );
  assert.throws(
    () => assertValidGeoQuery({ lat: 0, lng: 181, radiusKm: 1 }),
    InvalidGeoQueryError,
  );
  assert.throws(
    () => assertValidGeoQuery({ lat: 0, lng: 0, radiusKm: 0 }),
    InvalidGeoQueryError,
  );
});
