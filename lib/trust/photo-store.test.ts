import assert from "node:assert/strict";
import test from "node:test";
import { mediaMissingHash, persistablePhotoHashes, storedHashes } from "@/lib/trust/photo-store";

test("only a 16 character hash is stored", () => {
  const saved = persistablePhotoHashes([
    { mediaId: "m1", dHashHex: "0123456789abcdef" },
    { mediaId: "m2", dHashHex: "ABCDEF0123456789" },
    { mediaId: "m3", dHashHex: "short" },
    { mediaId: "m4", dHashHex: null },
  ]);
  assert.deepEqual(saved, [
    { mediaId: "m1", dHashHex: "0123456789abcdef" },
    { mediaId: "m2", dHashHex: "abcdef0123456789" },
  ]);
});

test("a stored hash is reused and a missing hash still needs the reader", () => {
  const rows = [
    { id: "a", dHashHex: "0123456789abcdef" },
    { id: "b", dHashHex: null },
  ];
  assert.deepEqual(storedHashes(rows), ["0123456789abcdef"]);
  assert.deepEqual(mediaMissingHash(rows).map((row) => row.id), ["b"]);
});
