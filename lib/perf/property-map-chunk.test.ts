/**
 * PropertyMap must not statically import react-leaflet hooks or Google Loader.
 * Leaflet bridge + Google Places load via dynamic import only.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("PropertyMap has no static react-leaflet or Google Loader imports", () => {
  const source = readFileSync("components/property/PropertyMap.tsx", "utf8");
  assert.doesNotMatch(
    source,
    /import\s*\{[^}]*\buseMap(Events)?\b[^}]*\}\s*from\s*["']react-leaflet["']/,
  );
  assert.doesNotMatch(
    source,
    /import\s*\{[^}]*\bLoader\b[^}]*\}\s*from\s*["']@googlemaps\/js-api-loader["']/,
  );
  assert.match(source, /import\("\.\/PropertyMapLeafletBridge"\)/);
  assert.match(source, /import\("@googlemaps\/js-api-loader"\)/);
});

test("Leaflet bridge owns useMap / useMapEvents", () => {
  const source = readFileSync(
    "components/property/PropertyMapLeafletBridge.tsx",
    "utf8",
  );
  assert.match(source, /useMapEvents/);
  assert.match(source, /useMap/);
  assert.match(source, /export function HeatmapLayer/);
  assert.match(source, /export function MapEventHandler/);
  assert.match(source, /export function MapController/);
});
