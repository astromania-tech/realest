/**
 * A-01: admin audit log create payload uses SQL NULL consistently.
 */
/// <reference types="node" />
import assert from "node:assert/strict";
import { test } from "node:test";
import { Prisma } from "./prisma/client.ts";
import { auditLogCreateData } from "./audit.ts";

test("[A-01] audit log coalesces missing target_id and metadata to SQL null", () => {
  const data = auditLogCreateData({
    actor_id: "00000000-0000-0000-0000-000000000001",
    action: "approve_agent",
  });
  assert.equal(data.target_id, null);
  assert.equal(data.metadata, Prisma.DbNull);
});

test("[A-01] audit log coalesces explicit null metadata to SQL null", () => {
  const data = auditLogCreateData({
    actor_id: "00000000-0000-0000-0000-000000000001",
    action: "user_moderation",
    target_id: null,
    metadata: null,
  });
  assert.equal(data.target_id, null);
  assert.equal(data.metadata, Prisma.DbNull);
});

test("[A-01] audit log keeps provided metadata object", () => {
  const meta = { notes: "ok" };
  const data = auditLogCreateData({
    actor_id: "00000000-0000-0000-0000-000000000001",
    action: "create_subadmin",
    target_id: "00000000-0000-0000-0000-000000000002",
    metadata: meta,
  });
  assert.equal(data.target_id, "00000000-0000-0000-0000-000000000002");
  assert.deepEqual(data.metadata, meta);
});
