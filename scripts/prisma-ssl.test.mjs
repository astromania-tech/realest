import assert from "node:assert/strict";
import test from "node:test";
import { pgAdapterConfig, pgAdapterSsl } from "./lib/pg-ssl.mjs";

test("pgAdapterConfig pins sslmode=disable on local Docker", () => {
  const cfg = pgAdapterConfig(
    "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
  );
  assert.equal(cfg.ssl, false);
  assert.match(cfg.connectionString, /sslmode=disable/);
});

test("pgAdapterConfig does not disable TLS on hosted supabase", () => {
  const cfg = pgAdapterConfig(
    "postgresql://postgres:secret@db.abcdefgh.supabase.co:6543/postgres",
  );
  assert.deepEqual(cfg.ssl, { rejectUnauthorized: false });
  assert.match(cfg.connectionString, /sslmode=require/);
  assert.doesNotMatch(cfg.connectionString, /sslmode=disable/);
});

test("local Docker URL does not force TLS", () => {
  assert.equal(
    pgAdapterSsl("postgresql://postgres:postgres@127.0.0.1:54322/postgres"),
    false,
  );
  assert.equal(
    pgAdapterSsl("postgresql://postgres:postgres@localhost:54322/postgres"),
    false,
  );
});

test("hosted supabase URL uses TLS", () => {
  const ssl = pgAdapterSsl(
    "postgresql://postgres:secret@db.abcdefgh.supabase.co:6543/postgres",
  );
  assert.deepEqual(ssl, { rejectUnauthorized: false });
});

test("sslmode=require uses TLS even if host is unfamiliar", () => {
  assert.deepEqual(
    pgAdapterSsl("postgresql://u:p@db.internal:5432/postgres?sslmode=require"),
    { rejectUnauthorized: false },
  );
});

test("sslmode=disable wins", () => {
  assert.equal(
    pgAdapterSsl(
      "postgresql://u:p@db.abcdefgh.supabase.co:6543/postgres?sslmode=disable",
    ),
    false,
  );
});
