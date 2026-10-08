/**
 * A-01: user moderation helpers used by suspend route after Prisma migration.
 * @see docs/engineering/data-write-path.md
 */
/// <reference types="node" />
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  computeSuspensionEndDate,
  isTemporarySuspensionExpired,
  mergeUserMetadataWithModeration,
  nextIsActive,
  nextModerationState,
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

test("[A-01] suspend/ban on already inactive user stay inactive", () => {
  assert.equal(nextIsActive("suspend", false), false);
  assert.equal(nextIsActive("ban", false), false);
});

test("[A-01] unsuspend/unban on already active user stay active", () => {
  assert.equal(nextIsActive("unsuspend", true), true);
  assert.equal(nextIsActive("unban", true), true);
});

test("[A-01] non-live listings are unlisted only on suspend/ban", () => {
  assert.equal(shouldUnlistNonLiveProperties("suspend"), true);
  assert.equal(shouldUnlistNonLiveProperties("ban"), true);
  assert.equal(shouldUnlistNonLiveProperties("unsuspend"), false);
  assert.equal(shouldUnlistNonLiveProperties("unban"), false);
});

test("[A-01] temporary suspend persists end_date from duration_days", () => {
  const now = Date.parse("2026-01-01T00:00:00.000Z");
  const end = computeSuspensionEndDate("suspend", 2, now);
  assert.equal(end, "2026-01-03T00:00:00.000Z");
  assert.equal(computeSuspensionEndDate("ban", 2, now), null);
  assert.equal(computeSuspensionEndDate("suspend", undefined, now), null);
});

test("[A-01] nextModerationState stores reason and end_date on suspend", () => {
  const now = Date.parse("2026-01-01T00:00:00.000Z");
  const state = nextModerationState({
    action: "suspend",
    reason: "policy violation x",
    notes: "see ticket",
    durationDays: 1,
    nowMs: now,
  });
  assert.equal(state.status, "suspended");
  assert.equal(state.reason, "policy violation x");
  assert.equal(state.notes, "see ticket");
  assert.equal(state.end_date, "2026-01-02T00:00:00.000Z");
});

test("[A-01] nextModerationState stores ban reason without end_date", () => {
  const state = nextModerationState({
    action: "ban",
    reason: "fraud confirmed",
    nowMs: Date.parse("2026-01-01T00:00:00.000Z"),
  });
  assert.equal(state.status, "banned");
  assert.equal(state.reason, "fraud confirmed");
  assert.equal(state.end_date, null);
});

test("[A-01] unsuspend clears moderation block on user metadata", () => {
  const state = nextModerationState({
    action: "unsuspend",
    reason: "appeal accepted",
  });
  assert.equal(state.status, "active");
  assert.equal(state.reason, null);
  assert.equal(state.end_date, null);
});

test("[A-01] mergeUserMetadataWithModeration preserves sibling metadata keys", () => {
  const merged = mergeUserMetadataWithModeration(
    { locale: "en", moderation: { status: "active" } },
    {
      status: "banned",
      reason: "spam",
      notes: null,
      end_date: null,
      updated_at: "2026-01-01T00:00:00.000Z",
    },
  ) as Record<string, unknown>;
  assert.equal(merged.locale, "en");
  assert.deepEqual(merged.moderation, {
    status: "banned",
    reason: "spam",
    notes: null,
    end_date: null,
    updated_at: "2026-01-01T00:00:00.000Z",
  });
});

test("[A-01] temporary suspension expiry helper", () => {
  assert.equal(
    isTemporarySuspensionExpired({
      status: "suspended",
      reason: "x",
      notes: null,
      end_date: "2020-01-01T00:00:00.000Z",
      updated_at: "2020-01-01T00:00:00.000Z",
    }),
    true,
  );
  assert.equal(
    isTemporarySuspensionExpired({
      status: "banned",
      reason: "x",
      notes: null,
      end_date: null,
      updated_at: "2020-01-01T00:00:00.000Z",
    }),
    false,
  );
});
