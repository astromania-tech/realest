import assert from "node:assert/strict";
import test from "node:test";
import { pgAdapterConfig, pgAdapterSsl } from "./lib/pg-ssl.mjs";

const HOSTED =
  "postgresql://postgres:secret@db.abcdefgh.supabase.co:6543/postgres";
const LOCAL = "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

test("pgAdapterConfig pins sslmode=disable on local Docker", () => {
  const cfg = pgAdapterConfig(LOCAL);
  assert.equal(cfg.ssl, false);
  assert.match(cfg.connectionString, /sslmode=disable/);
});

test("pgAdapterConfig encrypts hosted supabase without verify-full", () => {
  const cfg = pgAdapterConfig(HOSTED);
  assert.deepEqual(cfg.ssl, { rejectUnauthorized: false });
  assert.match(cfg.connectionString, /sslmode=require/);
  assert.doesNotMatch(cfg.connectionString, /sslmode=disable/);
  assert.doesNotMatch(cfg.connectionString, /sslmode=verify-full/);
});

test("hosted sslmode=verify-full is downgraded to require", () => {
  const cfg = pgAdapterConfig(`${HOSTED}?sslmode=verify-full`);
  assert.deepEqual(cfg.ssl, { rejectUnauthorized: false });
  assert.match(cfg.connectionString, /sslmode=require/);
  assert.doesNotMatch(cfg.connectionString, /sslmode=verify-full/);
});

test("local Docker URL does not force TLS", () => {
  assert.equal(pgAdapterSsl(LOCAL), false);
  assert.equal(
    pgAdapterSsl("postgresql://postgres:postgres@localhost:54322/postgres"),
    false,
  );
});

test("hosted supabase URL uses TLS without CA verify", () => {
  assert.deepEqual(pgAdapterSsl(HOSTED), { rejectUnauthorized: false });
});

test("pooler.supabase.com uses TLS without CA verify", () => {
  assert.deepEqual(
    pgAdapterSsl(
      "postgresql://u:p@aws-0-eu-west-1.pooler.supabase.com:6543/postgres",
    ),
    { rejectUnauthorized: false },
  );
});

test("sslmode=require still uses TLS without CA verify", () => {
  assert.deepEqual(
    pgAdapterSsl("postgresql://u:p@db.internal:5432/postgres?sslmode=require"),
    { rejectUnauthorized: false },
  );
});

test("sslmode=disable wins", () => {
  assert.equal(pgAdapterSsl(`${HOSTED}?sslmode=disable`), false);
});

test("hosted TLS matches last-known working Vercel handshake", () => {
  const cases = [
    HOSTED,
    `${HOSTED}?sslmode=require`,
    `${HOSTED}?sslmode=verify-full`,
    "postgresql://u:p@aws-0-eu-west-1.pooler.supabase.com:6543/postgres",
    "postgresql://u:p@db.internal:5432/postgres?sslmode=require",
  ];
  for (const url of cases) {
    const ssl = pgAdapterSsl(url);
    assert.notEqual(ssl, false, url);
    assert.equal(ssl.rejectUnauthorized, false, url);
    const cfg = pgAdapterConfig(url);
    assert.match(cfg.connectionString, /sslmode=require/, url);
    assert.doesNotMatch(cfg.connectionString, /sslmode=verify-full/, url);
  }
});
