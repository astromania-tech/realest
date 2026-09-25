import assert from "node:assert/strict";
import test from "node:test";
import { parse as parsePgUrl } from "pg-connection-string";
import { pgAdapterConfig, pgAdapterSsl } from "./lib/pg-ssl.mjs";

const HOSTED =
  "postgresql://postgres:secret@db.abcdefgh.supabase.co:6543/postgres";
const LOCAL = "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

test("pgAdapterConfig pins sslmode=disable on local Docker", () => {
  const cfg = pgAdapterConfig(LOCAL);
  assert.equal(cfg.ssl, false);
  assert.match(cfg.connectionString, /sslmode=disable/);
});

test("hosted matches PR #43: no sslmode rewrite, rejectUnauthorized false", () => {
  const cfg = pgAdapterConfig(HOSTED);
  assert.deepEqual(cfg.ssl, { rejectUnauthorized: false });
  assert.equal(cfg.connectionString, HOSTED);
  assert.doesNotMatch(cfg.connectionString, /sslmode=/);
});

test("hosted strips sslmode=require so pg cannot alias it to verify-full", () => {
  const cfg = pgAdapterConfig(`${HOSTED}?sslmode=require`);
  assert.deepEqual(cfg.ssl, { rejectUnauthorized: false });
  assert.doesNotMatch(cfg.connectionString, /sslmode=/);
  assert.equal(cfg.connectionString, HOSTED);
});

test("hosted strips sslmode=verify-full", () => {
  const cfg = pgAdapterConfig(`${HOSTED}?sslmode=verify-full&pgbouncer=true`);
  assert.deepEqual(cfg.ssl, { rejectUnauthorized: false });
  assert.doesNotMatch(cfg.connectionString, /sslmode=/);
  assert.match(cfg.connectionString, /pgbouncer=true/);
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

test("sslmode=disable wins", () => {
  assert.equal(pgAdapterSsl(`${HOSTED}?sslmode=disable`), false);
});

test("after config, URL parse does not reintroduce verify-full", () => {
  const cfg = pgAdapterConfig(`${HOSTED}?sslmode=require`);
  const merged = Object.assign(
    { connectionString: cfg.connectionString, ssl: cfg.ssl },
    parsePgUrl(cfg.connectionString),
  );
  assert.equal(merged.ssl.rejectUnauthorized, false);
});

test("raw sslmode=require in URL would override rejectUnauthorized false", () => {
  const url = `${HOSTED}?sslmode=require`;
  const merged = Object.assign(
    { connectionString: url, ssl: { rejectUnauthorized: false } },
    parsePgUrl(url),
  );
  // pg parse replaces the ssl object with {}. Missing ssl would be a different bug.
  assert.ok(merged.ssl && typeof merged.ssl === "object");
  assert.deepEqual(merged.ssl, {});
  assert.equal(merged.ssl.rejectUnauthorized, undefined);
});

test("hosted TLS matches last-known working Vercel handshake (PR #43)", () => {
  const cases = [
    HOSTED,
    `${HOSTED}?sslmode=require`,
    `${HOSTED}?sslmode=verify-full`,
    "postgresql://u:p@aws-0-eu-west-1.pooler.supabase.com:6543/postgres",
  ];
  for (const url of cases) {
    const ssl = pgAdapterSsl(url);
    assert.notEqual(ssl, false, url);
    assert.equal(ssl.rejectUnauthorized, false, url);
    const cfg = pgAdapterConfig(url);
    assert.doesNotMatch(cfg.connectionString, /sslmode=/, url);
    assert.doesNotMatch(cfg.connectionString, /no-verify/, url);
    assert.deepEqual(cfg.ssl, { rejectUnauthorized: false }, url);
  }
});

test("config never emits sslmode=no-verify", () => {
  const urls = [
    HOSTED,
    `${HOSTED}?sslmode=require`,
    `${HOSTED}?sslmode=no-verify`,
    LOCAL,
  ];
  for (const url of urls) {
    const cfg = pgAdapterConfig(url);
    assert.doesNotMatch(cfg.connectionString, /sslmode=no-verify/, url);
  }
});

test("isHostedPostgresUrl uses host or libpq modes, not no-verify alone", () => {
  // A random host with only sslmode=no-verify is not classified as hosted.
  assert.equal(
    pgAdapterSsl("postgresql://u:p@db.example.internal:5432/postgres?sslmode=no-verify"),
    false,
  );
  assert.deepEqual(
    pgAdapterSsl("postgresql://u:p@db.example.internal:5432/postgres?sslmode=require"),
    { rejectUnauthorized: false },
  );
});
