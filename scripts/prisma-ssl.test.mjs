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

test("pgAdapterConfig verifies the cert on hosted supabase", () => {
  const cfg = pgAdapterConfig(HOSTED);
  assert.deepEqual(cfg.ssl, { rejectUnauthorized: true });
  assert.match(cfg.connectionString, /sslmode=verify-full/);
  assert.doesNotMatch(cfg.connectionString, /sslmode=disable/);
  assert.doesNotMatch(cfg.connectionString, /sslmode=require/);
});

test("hosted sslmode=require is upgraded to verify-full", () => {
  const cfg = pgAdapterConfig(`${HOSTED}?sslmode=require`);
  assert.deepEqual(cfg.ssl, { rejectUnauthorized: true });
  assert.match(cfg.connectionString, /sslmode=verify-full/);
  assert.doesNotMatch(cfg.connectionString, /sslmode=require/);
});

test("local Docker URL does not force TLS", () => {
  assert.equal(pgAdapterSsl(LOCAL), false);
  assert.equal(
    pgAdapterSsl("postgresql://postgres:postgres@localhost:54322/postgres"),
    false,
  );
});

test("hosted supabase URL verifies TLS", () => {
  assert.deepEqual(pgAdapterSsl(HOSTED), { rejectUnauthorized: true });
});

test("pooler.supabase.com verifies TLS", () => {
  assert.deepEqual(
    pgAdapterSsl(
      "postgresql://u:p@aws-0-eu-west-1.pooler.supabase.com:6543/postgres",
    ),
    { rejectUnauthorized: true },
  );
});

test("sslmode=require still uses TLS and verifies the cert", () => {
  assert.deepEqual(
    pgAdapterSsl("postgresql://u:p@db.internal:5432/postgres?sslmode=require"),
    { rejectUnauthorized: true },
  );
});

test("sslmode=disable wins", () => {
  assert.equal(pgAdapterSsl(`${HOSTED}?sslmode=disable`), false);
});

test("hosted TLS never sets rejectUnauthorized false", () => {
  const cases = [
    HOSTED,
    `${HOSTED}?sslmode=require`,
    "postgresql://u:p@aws-0-eu-west-1.pooler.supabase.com:6543/postgres",
    "postgresql://u:p@db.internal:5432/postgres?sslmode=require",
  ];
  for (const url of cases) {
    const ssl = pgAdapterSsl(url);
    assert.notEqual(ssl, false, url);
    assert.equal(ssl.rejectUnauthorized, true, url);
  }
});
