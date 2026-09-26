/**
 * A-01: user moderation helpers used by suspend route after Prisma migration.
 * @see docs/engineering/data-write-path.md
 */
/// <reference types="node" />
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  nextIsActive,
  shouldUnlistNonLiveProperties,
} from "./user-moderation.ts";

test("[A-01] suspend and ban deactivate the user", () => {
  assert.equal(nextIsActive("suspend", true), false);
  assert.equal(nextIsActive("ban", true), false);
});

test("[A-01] unsuspend and unban reactivate the user", () => {
  assert.equal(nextIsActive("unsuspend", false), true);
  assert.equal(nextIsActive("unban", false), true);
});

test("[A-01] non-live listings are unlisted only on suspend/ban", () => {
  assert.equal(shouldUnlistNonLiveProperties("suspend"), true);
  assert.equal(shouldUnlistNonLiveProperties("ban"), true);
  assert.equal(shouldUnlistNonLiveProperties("unsuspend"), false);
  assert.equal(shouldUnlistNonLiveProperties("unban"), false);
});
