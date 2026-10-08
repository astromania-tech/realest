import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_OCR_TIMEOUT_MS,
  resolveOcrTimeoutMs,
  withTimeout,
} from "./ocr.ts";

test("resolveOcrTimeoutMs defaults and rejects bad values", () => {
  assert.equal(resolveOcrTimeoutMs({}), DEFAULT_OCR_TIMEOUT_MS);
  assert.equal(resolveOcrTimeoutMs({ VALIDATION_OCR_TIMEOUT_MS: "5000" }), 5000);
  assert.equal(resolveOcrTimeoutMs({ VALIDATION_OCR_TIMEOUT_MS: "0" }), DEFAULT_OCR_TIMEOUT_MS);
  assert.equal(resolveOcrTimeoutMs({ VALIDATION_OCR_TIMEOUT_MS: "nope" }), DEFAULT_OCR_TIMEOUT_MS);
});

test("withTimeout rejects when the promise never settles", async () => {
  const hang = new Promise<string>(() => {});
  await assert.rejects(
    () => withTimeout(hang, 50, "image OCR"),
    /image OCR timed out after 50ms/,
  );
});

test("withTimeout resolves when the promise wins the race", async () => {
  const value = await withTimeout(Promise.resolve("ok"), 200, "image OCR");
  assert.equal(value, "ok");
});
