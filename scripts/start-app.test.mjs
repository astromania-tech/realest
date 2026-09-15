import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  collectEnvIssues,
  decidePortAction,
  escapeEnvValue,
  isPlaceholder,
  looksLikeRealestHtml,
  mapSupabaseStatusEnv,
  meetsNodeRequirement,
  mergeEnvSources,
  missingKeysMessage,
  parseEnvFile,
  parseListenerPid,
  parseNodeVersion,
  pickListenPort,
  sameRepoPath,
  serializeEnvFile,
  startAppReadyLine,
  waitForHttp,
} from "./lib/start-app-core.mjs";

const REPO_ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");

test("parseEnvFile skips comments and unwraps quotes", () => {
  const env = parseEnvFile(`
# comment
export NEXT_PUBLIC_SUPABASE_URL="https://abc.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.payload.sig'
EMPTY=
NOT_A_LINE
`);
  assert.equal(env.NEXT_PUBLIC_SUPABASE_URL, "https://abc.supabase.co");
  assert.equal(
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.payload.sig",
  );
  assert.equal(env.EMPTY, "");
  assert.equal(env.NOT_A_LINE, undefined);
});

test("isPlaceholder catches example values and keeps real keys", () => {
  assert.equal(isPlaceholder(""), true);
  assert.equal(isPlaceholder("your-supabase-url"), true);
  assert.equal(isPlaceholder("https://your-project.supabase.co"), true);
  assert.equal(isPlaceholder("https://example.supabase.co"), true);
  assert.equal(isPlaceholder("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."), true);
  assert.equal(isPlaceholder("re_your_api_key_here"), true);
  assert.equal(
    isPlaceholder("https://rzclzcermmfrbvvjegwg.supabase.co"),
    false,
  );
  assert.equal(
    isPlaceholder("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.payload.signature"),
    false,
  );
});

test("collectEnvIssues reports required vs recommended", () => {
  const issues = collectEnvIssues({
    NEXT_PUBLIC_SUPABASE_URL: "https://abc.supabase.co",
  });
  assert.deepEqual(issues.missingRequired, ["NEXT_PUBLIC_SUPABASE_ANON_KEY"]);
  assert.deepEqual(issues.missingRecommended, [
    "SUPABASE_SERVICE_ROLE_KEY",
    "DATABASE_URL",
  ]);
});

test("placeholder required keys count as missing", () => {
  const issues = collectEnvIssues({
    NEXT_PUBLIC_SUPABASE_URL: "your-supabase-url",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "your-supabase-anon-key",
  });
  assert.deepEqual(issues.missingRequired, [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ]);
});

test("node version gate accepts 20+ only", () => {
  assert.deepEqual(parseNodeVersion("v20.20.2"), {
    major: 20,
    minor: 20,
    patch: 2,
  });
  assert.equal(meetsNodeRequirement("v18.20.0"), false);
  assert.equal(meetsNodeRequirement("v20.0.0"), true);
  assert.equal(meetsNodeRequirement("v24.20.0"), true);
  assert.equal(meetsNodeRequirement("nope"), false);
});

test("mapSupabaseStatusEnv remaps CLI output to Next names", () => {
  const mapped = mapSupabaseStatusEnv({
    API_URL: "http://127.0.0.1:54321",
    ANON_KEY: "anon-local-key",
    SERVICE_ROLE_KEY: "service-local-key",
    DB_URL: "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
  });
  assert.equal(mapped.NEXT_PUBLIC_SUPABASE_URL, "http://127.0.0.1:54321");
  assert.equal(mapped.NEXT_PUBLIC_SUPABASE_ANON_KEY, "anon-local-key");
  assert.equal(mapped.SUPABASE_SERVICE_ROLE_KEY, "service-local-key");
  assert.equal(
    mapped.DATABASE_URL,
    "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
  );
  assert.equal(mapped.DIRECT_URL, mapped.DATABASE_URL);
  assert.equal(mapped.NEXT_PUBLIC_APP_MODE, "development");
});

test("serializeEnvFile round-trips quoted values", () => {
  const text = serializeEnvFile({
    DATABASE_URL: "postgresql://postgres:p@ss word@127.0.0.1:54322/postgres",
    SIMPLE: "abc",
  });
  const parsed = parseEnvFile(text);
  assert.equal(parsed.SIMPLE, "abc");
  assert.equal(
    parsed.DATABASE_URL,
    "postgresql://postgres:p@ss word@127.0.0.1:54322/postgres",
  );
  assert.equal(escapeEnvValue("no-space"), "no-space");
});

test("mergeEnvSources lets later sources win", () => {
  const merged = mergeEnvSources(
    { A: "1", B: "2" },
    { B: "3", C: "4" },
  );
  assert.deepEqual(merged, { A: "1", B: "3", C: "4" });
});

test("pickListenPort skips occupied ports", () => {
  assert.equal(pickListenPort(3000, [3000, 3001]), 3002);
});

test("parseListenerPid reads ss and lsof output", () => {
  const ss =
    'LISTEN 0 511 *:3000 *:* users:(("next-server (v1",pid=76279,fd=19))';
  assert.equal(parseListenerPid(ss, 3000), 76279);
  assert.equal(parseListenerPid("76279\n", 3000), 76279);
  assert.equal(parseListenerPid("", 3000), null);
});

test("sameRepoPath ignores trailing slashes", () => {
  assert.equal(
    sameRepoPath("/home/chymezy/Documents/realest/", "/home/chymezy/Documents/realest"),
    true,
  );
  assert.equal(
    sameRepoPath("/home/chymezy/Documents/realest", "/home/chymezy/Documents/projects/realest"),
    false,
  );
});

test("looksLikeRealestHtml requires brand plus a known asset", () => {
  assert.equal(looksLikeRealestHtml("<title>nginx</title>"), false);
  assert.equal(
    looksLikeRealestHtml('<title>RealEST</title><img src="/realest-logo-wordmark-dark.svg">'),
    true,
  );
});

test("decidePortAction reuses only the same repo", () => {
  assert.deepEqual(
    decidePortAction({
      preferredPort: 3000,
      repoRoot: "/home/chymezy/Documents/realest",
      usedPorts: [],
    }),
    { action: "listen", port: 3000, reason: "free" },
  );
  assert.deepEqual(
    decidePortAction({
      preferredPort: 3000,
      repoRoot: "/home/chymezy/Documents/realest",
      occupantCwd: "/home/chymezy/Documents/realest",
      usedPorts: [3000],
    }),
    { action: "reuse", port: 3000, reason: "same-repo" },
  );
  assert.deepEqual(
    decidePortAction({
      preferredPort: 3000,
      repoRoot: "/home/chymezy/Documents/realest",
      occupantCwd: "/home/chymezy/Documents/projects/realest",
      usedPorts: [3000],
    }),
    { action: "listen", port: 3001, reason: "other-repo" },
  );
});

test("missingKeysMessage names the exact keys", () => {
  const message = missingKeysMessage(["NEXT_PUBLIC_SUPABASE_URL"]);
  assert.match(message, /NEXT_PUBLIC_SUPABASE_URL/);
  assert.match(message, /\.\/start\.sh/);
});

test("waitForHttp resolves when the server answers", async () => {
  const server = createServer((_req, res) => {
    res.writeHead(204);
    res.end();
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  const result = await waitForHttp(`http://127.0.0.1:${port}/`, {
    timeoutMs: 2_000,
    intervalMs: 50,
  });
  server.close();
  assert.equal(result.status, 204);
  assert.equal(result.ok, true);
});

test("waitForHttp times out against a closed port", async () => {
  await assert.rejects(
    () =>
      waitForHttp("http://127.0.0.1:1/", {
        timeoutMs: 200,
        intervalMs: 50,
      }),
    /Timed out/,
  );
});

test("startAppReadyLine is grep-stable", () => {
  assert.equal(
    startAppReadyLine("http://127.0.0.1:3000"),
    "START_APP_READY url=http://127.0.0.1:3000",
  );
});

test("start-app --check fails in a repo without keys", () => {
  const dir = mkdtempSync(join(tmpdir(), "realest-start-"));
  writeFileSync(
    join(dir, "package.json"),
    JSON.stringify({ name: "fixture", private: true }),
  );
  writeFileSync(
    join(dir, ".env.example"),
    "NEXT_PUBLIC_SUPABASE_URL=your-supabase-url\nNEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key\n",
  );

  const script = join(REPO_ROOT, "scripts", "start-app.mjs");
  const result = spawnSync(
    process.execPath,
    [script, "--check", "--no-local-supabase"],
    {
      cwd: dir,
      encoding: "utf8",
      env: {
        PATH: process.env.PATH,
        HOME: process.env.HOME,
        START_APP_ROOT: dir,
      },
    },
  );
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /Missing:/);
});

test("start-app --check passes when required keys are real", () => {
  const dir = mkdtempSync(join(tmpdir(), "realest-start-ok-"));
  writeFileSync(join(dir, "package.json"), JSON.stringify({ name: "fixture", private: true }));
  writeFileSync(
    join(dir, ".env.example"),
    "NEXT_PUBLIC_SUPABASE_URL=your-supabase-url\nNEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key\n",
  );
  writeFileSync(
    join(dir, ".env.local"),
    [
      "NEXT_PUBLIC_SUPABASE_URL=https://abc.supabase.co",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.payload.sig",
      "SUPABASE_SERVICE_ROLE_KEY=service-role-not-a-placeholder",
      "DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres",
      "",
    ].join("\n"),
  );

  const script = join(REPO_ROOT, "scripts", "start-app.mjs");
  const result = spawnSync(
    process.execPath,
    [script, "--check", "--no-local-supabase"],
    {
      cwd: dir,
      encoding: "utf8",
      env: {
        PATH: process.env.PATH,
        HOME: process.env.HOME,
        START_APP_ROOT: dir,
      },
    },
  );
  assert.equal(result.status, 0, result.stderr + result.stdout);
  assert.match(result.stdout, /Env check passed/);
});
