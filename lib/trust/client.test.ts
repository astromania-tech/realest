import assert from "node:assert/strict";
import test from "node:test";
import { readTrustFile } from "@/lib/trust/client";

test("the client sends the production token", async () => {
  let authorization = "";
  const fetchImpl: typeof fetch = async (_url, init) => {
    const headers = new Headers(init?.headers);
    authorization = headers.get("authorization") ?? "";
    return new Response(JSON.stringify({
      reader: "realest-trust-reader",
      contractVersion: "1.1.0",
      kind: "image",
      document: null,
      image: null,
      expansions: [],
      limitations: [],
    }), { status: 200 });
  };
  await readTrustFile({
    kind: "image",
    mimeType: "image/png",
    bytes: Buffer.from("x"),
    env: { NODE_ENV: "test", TRUST_READER_URL: "https://trust.realest.internal", TRUST_READER_TOKEN: "prod-token" },
    fetchImpl,
  });
  assert.equal(authorization, "Bearer prod-token");
});
