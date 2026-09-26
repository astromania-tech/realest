/**
 * A-01: sub-admin create must not leave Auth orphans when Prisma fails.
 */
/// <reference types="node" />
import assert from "node:assert/strict";
import { test } from "node:test";
import { createWithAuthDbCompensate } from "./auth-db-compensate.ts";

test("[A-01] subadmin create rolls back Auth when Prisma persist fails", async () => {
  const deleted: string[] = [];
  const result = await createWithAuthDbCompensate({
    createAuthUser: async () => ({ userId: "auth-1" }),
    persistDb: async () => {
      throw new Error("db down");
    },
    deleteAuthUser: async (id) => {
      deleted.push(id);
    },
  });
  assert.deepEqual(result, { ok: false, error: "db_persist_failed" });
  assert.deepEqual(deleted, ["auth-1"]);
});

test("[A-01] subadmin create keeps Auth when Prisma persist succeeds", async () => {
  const deleted: string[] = [];
  const result = await createWithAuthDbCompensate({
    createAuthUser: async () => ({ userId: "auth-2" }),
    persistDb: async () => {},
    deleteAuthUser: async (id) => {
      deleted.push(id);
    },
  });
  assert.deepEqual(result, { ok: true, userId: "auth-2" });
  assert.deepEqual(deleted, []);
});

test("[A-01] subadmin create reports auth_create_failed without delete", async () => {
  const deleted: string[] = [];
  const result = await createWithAuthDbCompensate({
    createAuthUser: async () => {
      throw new Error("auth down");
    },
    persistDb: async () => {},
    deleteAuthUser: async (id) => {
      deleted.push(id);
    },
  });
  assert.deepEqual(result, { ok: false, error: "auth_create_failed" });
  assert.deepEqual(deleted, []);
});
