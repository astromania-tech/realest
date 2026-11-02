import assert from "node:assert/strict";
import test from "node:test";
import { pageWindow, parsePage } from "./page-window.ts";

test("page window slices a long list and clamps the page", () => {
  const first = pageWindow(200, 1, 6);
  assert.deepEqual(
    { page: first.page, pageCount: first.pageCount, start: first.start, end: first.end, from: first.from, to: first.to },
    { page: 1, pageCount: 34, start: 0, end: 6, from: 1, to: 6 },
  );

  const last = pageWindow(200, 99, 6);
  assert.equal(last.page, 34);
  assert.equal(last.start, 198);
  assert.equal(last.to, 200);

  const empty = pageWindow(0, 3, 6);
  assert.equal(empty.page, 1);
  assert.equal(empty.from, 0);
  assert.equal(empty.to, 0);
});

test("parsePage rejects missing and junk values", () => {
  assert.equal(parsePage(undefined), 1);
  assert.equal(parsePage("0"), 1);
  assert.equal(parsePage("-4"), 1);
  assert.equal(parsePage("3.9"), 3);
  assert.equal(parsePage(["4", "9"]), 4);
});
