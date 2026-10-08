/**
 * A-01: requireAdmin structured errors (auth vs role vs DB failure).
 */
/// <reference types="node" />
import assert from "node:assert/strict";
import { test } from "node:test";
import { requireAdmin } from "./require-admin.ts";

test("[A-01] requireAdmin returns 401 when there is no session user", async () => {
  const result = await requireAdmin({
    getAuthUser: async () => ({ data: { user: null } }),
  });
  assert.deepEqual(result, {
    ok: false,
    error: "Unauthorized",
    status: 401,
  });
});

test("[A-01] requireAdmin returns 403 when role is not admin", async () => {
  const result = await requireAdmin({
    getAuthUser: async () => ({
      data: { user: { id: "u1", email: "a@b.c" } },
    }),
    findUserRole: async () => ({ role: "user" }),
  });
  assert.deepEqual(result, {
    ok: false,
    error: "Forbidden",
    status: 403,
  });
});

test("[A-01] requireAdmin returns 500 when role lookup throws", async () => {
  const result = await requireAdmin({
    getAuthUser: async () => ({
      data: { user: { id: "u1", email: "a@b.c" } },
    }),
    findUserRole: async () => {
      throw new Error("db down");
    },
  });
  assert.deepEqual(result, {
    ok: false,
    error: "Internal server error",
    status: 500,
  });
});

test("[A-01] requireAdmin returns ok for admin role", async () => {
  const result = await requireAdmin({
    getAuthUser: async () => ({
      data: { user: { id: "u1", email: "admin@x.com" } },
    }),
    findUserRole: async () => ({ role: "admin" }),
  });
  assert.deepEqual(result, {
    ok: true,
    userId: "u1",
    email: "admin@x.com",
  });
});
