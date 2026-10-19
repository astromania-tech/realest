import assert from "node:assert/strict";
import test from "node:test";
import { idImageMatchFromBody, readIdImage } from "@/lib/kyc/id-image";

const jpeg =
  "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=";

test("an ID photo must be a JPEG, PNG, or WebP within 1 MB", () => {
  assert.equal(readIdImage(`data:image/jpeg;base64,${jpeg}`)?.base64, jpeg);
  assert.equal(readIdImage("not-an-image"), null);
  assert.equal(readIdImage(Buffer.from("plain text").toString("base64")), null);
  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
  assert.ok(readIdImage(png.toString("base64")));
});

test("the uploaded photo matches only when Youverify says the face matched the ID", () => {
  assert.equal(
    idImageMatchFromBody({
      data: {
        selfieValidation: true,
        validations: { selfie: { selfieVerification: { match: false, confidenceLevel: 12, threshold: 80 } } },
      },
    }),
    "mismatch",
  );
  assert.equal(
    idImageMatchFromBody({
      data: { selfieValidation: false, validations: { selfie: { selfieVerification: { match: true } } } },
    }),
    "match",
  );
  assert.equal(idImageMatchFromBody({ data: { status: "found", selfieValidation: true } }), "incomplete");
});
