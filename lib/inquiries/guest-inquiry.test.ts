import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { guestInquiryHttpResult } from "@/lib/inquiries/guest-inquiry";

test("a saved inquiry stays saved when the email does not send", () => {
  const saved = guestInquiryHttpResult({ saved: true, notified: true });
  const quiet = guestInquiryHttpResult({ saved: true, notified: false });
  const lost = guestInquiryHttpResult({ saved: false, notified: false });
  assert.equal(saved.status, 201);
  assert.equal(saved.body.notified, true);
  assert.equal(quiet.status, 201);
  assert.equal(quiet.body.saved, true);
  assert.equal(quiet.body.notified, false);
  assert.equal(quiet.body.message?.includes("sent successfully"), false);
  assert.equal(lost.status, 500);
});

test("the guest route writes a row before it sends mail", () => {
  const source = readFileSync("app/api/inquiries/guest/route.ts", "utf8");
  const insertAt = source.indexOf("insert into public.inquiries");
  const mailAt = source.indexOf("await sendInquiryEmail");
  assert.ok(insertAt > 0);
  assert.ok(mailAt > insertAt);
  assert.equal(source.includes("Inquiry sent successfully"), false);
});
