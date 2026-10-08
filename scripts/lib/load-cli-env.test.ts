import assert from "node:assert/strict";
import test from "node:test";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { loadCliEnv } from "./load-cli-env.ts";

test("loadCliEnv prefers .env.local over .env", () => {
  const dir = mkdtempSync(join(tmpdir(), "load-cli-env-"));
  const prevUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const prevExtra = process.env.LOAD_CLI_ENV_EXTRA;

  try {
    writeFileSync(
      join(dir, ".env"),
      "NEXT_PUBLIC_SUPABASE_URL=https://from-env.supabase.co\nLOAD_CLI_ENV_EXTRA=from-env\n",
    );
    writeFileSync(
      join(dir, ".env.local"),
      "NEXT_PUBLIC_SUPABASE_URL=https://from-local.supabase.co\n",
    );

    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.LOAD_CLI_ENV_EXTRA;

    const { loaded } = loadCliEnv(dir);
    assert.deepEqual(loaded, [".env", ".env.local"]);
    assert.equal(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      "https://from-local.supabase.co",
    );
    assert.equal(process.env.LOAD_CLI_ENV_EXTRA, "from-env");
  } finally {
    if (prevUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    else process.env.NEXT_PUBLIC_SUPABASE_URL = prevUrl;
    if (prevExtra === undefined) delete process.env.LOAD_CLI_ENV_EXTRA;
    else process.env.LOAD_CLI_ENV_EXTRA = prevExtra;
    rmSync(dir, { recursive: true, force: true });
  }
});

test("loadCliEnv is a no-op when neither file exists", () => {
  const dir = mkdtempSync(join(tmpdir(), "load-cli-env-empty-"));
  try {
    const { loaded } = loadCliEnv(dir);
    assert.deepEqual(loaded, []);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
