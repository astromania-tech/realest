import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import sodium from "libsodium-wrappers";
import test from "node:test";
import {
  deploymentOutcome,
  notifyDeployment,
  serializeBuildEvents,
} from "../scripts/vercel-deployment-notifications";

test("production workflow leaves shipping to the Vercel GitHub app", () => {
  const workflow = readFileSync(".github/workflows/deploy.yml", "utf8");
  assert.equal(workflow.includes("vercel/action@"), false);
  assert.equal(workflow.includes("amondnet/vercel-action"), false);
  assert.equal(workflow.includes("vercel-token"), false);
  assert.match(workflow, /vercel\[bot\]/);
  assert.equal(workflow.includes("ignoreBuildErrors"), false);
  const nextConfig = readFileSync("next.config.mjs", "utf8");
  assert.equal(nextConfig.includes("ignoreBuildErrors"), false);
});

test("Vercel notifications report deployment outcome with failure logs", () => {
  const workflow = readFileSync(
    ".github/workflows/vercel-deployment-notifications.yml",
    "utf8",
  );
  assert.match(workflow, /repository_dispatch/);
  assert.match(workflow, /vercel\.deployment\.ready/);
  assert.match(workflow, /vercel\.deployment\.error/);
  assert.match(workflow, /SLACK_CLIENT_ID: \$\{\{ secrets\.SLACK_CLIENT_ID \}\}/);
  assert.match(workflow, /SLACK_CLIENT_SECRET: \$\{\{ secrets\.SLACK_CLIENT_SECRET \}\}/);
  assert.match(workflow, /SLACK_REFRESH_TOKEN: \$\{\{ secrets\.SLACK_REFRESH_TOKEN \}\}/);
  assert.match(workflow, /GH_ACTIONS_SECRETS_TOKEN: \$\{\{ secrets\.GH_ACTIONS_SECRETS_TOKEN \}\}/);
  assert.doesNotMatch(workflow, /SLACK_BOT_TOKEN/);

  assert.equal(deploymentOutcome("vercel.deployment.ready"), "success");
  assert.equal(deploymentOutcome("vercel.deployment.success"), "success");
  assert.equal(deploymentOutcome("vercel.deployment.error"), "failure");
  assert.equal(deploymentOutcome("vercel.deployment.failed"), "failure");
  assert.equal(deploymentOutcome("vercel.deployment.canceled"), null);
});

test("Vercel notification workflow installs dependencies and runs its TypeScript handler", () => {
  const workflow = readFileSync(
    ".github/workflows/vercel-deployment-notifications.yml",
    "utf8",
  );
  assert.match(workflow, /uses:\s*actions\/setup-node@v4/);
  assert.match(workflow, /run:\s*npm ci/);
  assert.match(
    workflow,
    /run:\s*npx tsx scripts\/vercel-deployment-notifications\.ts/,
  );
  assert.doesNotMatch(workflow, /vercel-deployment-notifications\.mjs/);
});

test("serialized Vercel build logs retain events and redact credentials", () => {
  const events = [
    { type: "stdout", payload: { text: "build started" } },
    {
      type: "stderr",
      payload: {
        text: "TOKEN=service-token-value; Authorization: Bearer abc.def.ghi",
      },
    },
    { type: "report", api_key: "service-token-value" },
  ];

  const serialized = serializeBuildEvents(events, ["service-token-value"]);
  const parsed = JSON.parse(serialized);
  assert.equal(parsed.length, 3);
  assert.match(serialized, /build started/);
  assert.doesNotMatch(serialized, /service-token-value|abc\.def\.ghi/);
  assert.match(serialized, /\[REDACTED\]/);
  const serviceRoleLog = serializeBuildEvents([
    { type: "stdout", text: "SUPABASE_SERVICE_ROLE_KEY=private-key-value" },
    { type: "stderr", text: "postgresql://user:db-password@db.example.test/app" },
  ]);
  assert.doesNotMatch(serviceRoleLog, /private-key-value|db-password/);
  assert.throws(() => serializeBuildEvents([]), /no build log events/);
});

test("failed deployment fetches complete Vercel logs and uploads a redacted file to Slack", async () => {
  const env = {
    VERCEL_TEAM_ID: "team_test",
    VERCEL_TOKEN: "vercel-token-test",
    SLACK_CLIENT_ID: "slack-client-id",
    SLACK_CLIENT_SECRET: "slack-client-secret",
    SLACK_REFRESH_TOKEN: "slack-refresh-token",
    GH_ACTIONS_SECRETS_TOKEN: "github-actions-token",
    GITHUB_REPOSITORY: "astromania-tech/realest",
    SLACK_WEBHOOK_INCIDENTS: "https://hooks.slack.invalid/incidents",
    SLACK_WEBHOOK_RELEASES: "https://hooks.slack.invalid/releases",
    SLACK_CHANNEL_INCIDENTS: "C_INCIDENTS",
  };
  const previousEnv = Object.fromEntries(
    Object.keys(env).map((key) => [key, process.env[key]]),
  );
  const originalFetch = globalThis.fetch;
  const requests: { url: URL; init?: RequestInit; body?: string }[] = [];
  await sodium.ready;
  const keyPair = sodium.crypto_box_keypair();

  for (const [key, value] of Object.entries(env)) process.env[key] = value;
  globalThis.fetch = async (input, init) => {
    const url = new URL(input instanceof Request ? input.url : String(input));
    const request: (typeof requests)[number] = { url, init };
    requests.push(request);
    if (url.hostname === "api.vercel.com") {
      return new Response(
        JSON.stringify([{
          type: "stderr",
          text: "TOKEN=build-secret-value CLIENT_SECRET=slack-client-secret REFRESH_TOKEN=slack-refresh-token ACCESS_TOKEN=slack-access-token GH_ACTIONS_SECRETS_TOKEN=github-actions-token",
        }]),
        { headers: { "content-type": "application/json" } },
      );
    }
    if (url.pathname === "/api/oauth.v2.access") {
      assert.equal(new URLSearchParams(String(init?.body)).get("grant_type"), "refresh_token");
      assert.equal(new URLSearchParams(String(init?.body)).get("refresh_token"), "slack-refresh-token");
      assert.match(String(new Headers(init?.headers).get("authorization")), /^Basic /);
      return new Response(
        JSON.stringify({
          ok: true,
          access_token: "slack-access-token",
          refresh_token: "slack-refresh-token-rotated",
          scope: "files:write",
          token_type: "bot",
        }),
        { headers: { "content-type": "application/json" } },
      );
    }
    if (url.pathname.endsWith("/actions/secrets/public-key")) {
      assert.equal(
        new Headers(init?.headers).get("authorization"),
        "Bearer github-actions-token",
      );
      return new Response(
        JSON.stringify({
          key: sodium.to_base64(keyPair.publicKey, sodium.base64_variants.ORIGINAL),
          key_id: "github-key-id",
        }),
        { headers: { "content-type": "application/json" } },
      );
    }
    if (url.pathname.endsWith("/actions/secrets/SLACK_REFRESH_TOKEN")) {
      assert.equal(init?.method, "PUT");
      assert.equal(
        new Headers(init?.headers).get("authorization"),
        "Bearer github-actions-token",
      );
      request.body = String(init?.body);
      return new Response(null, { status: 204 });
    }
    if (url.pathname === "/api/files.getUploadURLExternal") {
      assert.equal(new Headers(init?.headers).get("authorization"), "Bearer slack-access-token");
      return new Response(
        JSON.stringify({
          ok: true,
          upload_url: "https://upload.slack.invalid/file",
          file_id: "F_TEST",
        }),
        { headers: { "content-type": "application/json" } },
      );
    }
    if (url.hostname === "upload.slack.invalid") {
      request.body = await new Response(init?.body).text();
      return new Response("ok");
    }
    if (url.pathname === "/api/files.completeUploadExternal") {
      assert.equal(new Headers(init?.headers).get("authorization"), "Bearer slack-access-token");
      request.body = String(init?.body);
      return new Response(JSON.stringify({ ok: true }), {
        headers: { "content-type": "application/json" },
      });
    }
    throw new Error(`Unexpected fetch in test: ${url.hostname}${url.pathname}`);
  };

  try {
    await notifyDeployment(
      {
        action: "vercel.deployment.error",
        client_payload: {
          id: "evt_test",
          payload: {
            deployment: {
              id: "dpl_test",
              target: "preview",
              meta: {
                githubCommitRef: "feature/test",
                githubCommitSha: "abcdef1234567890",
              },
            },
            project: { id: "prj_test", name: "realest" },
          },
        },
      },
      "prj_test",
    );
  } finally {
    globalThis.fetch = originalFetch;
    for (const [key, value] of Object.entries(previousEnv)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }

  const vercelRequest = requests.find((request) => request.url.hostname === "api.vercel.com");
  assert.ok(vercelRequest);
  assert.match(vercelRequest.url.pathname, /\/deployments\/dpl_test\/events$/);
  assert.doesNotMatch(vercelRequest.url.pathname, /evt_test/);
  assert.equal(vercelRequest.url.searchParams.get("limit"), "-1");
  assert.equal(vercelRequest.url.searchParams.get("builds"), "1");
  assert.equal(vercelRequest.url.searchParams.get("teamId"), "team_test");

  const secretUpdate = requests.find((request) => request.url.pathname.endsWith("/actions/secrets/SLACK_REFRESH_TOKEN"));
  assert.ok(secretUpdate?.body);
  const secretPayload = JSON.parse(secretUpdate.body);
  const decryptedRefreshToken = sodium.crypto_box_seal_open(
    sodium.from_base64(secretPayload.encrypted_value, sodium.base64_variants.ORIGINAL),
    keyPair.publicKey,
    keyPair.privateKey,
  );
  assert.equal(sodium.to_string(decryptedRefreshToken), "slack-refresh-token-rotated");

  const uploaded = requests.find((request) => request.url.hostname === "upload.slack.invalid");
  assert.ok(uploaded?.body);
  assert.match(uploaded.body, /stderr/);
  assert.doesNotMatch(
    uploaded.body,
    /build-secret-value|slack-client-secret|slack-refresh-token|slack-access-token|github-actions-token/,
  );
  assert.match(uploaded.url.href, /upload\.slack\.invalid/);

  const completed = requests.find((request) => request.url.pathname === "/api/files.completeUploadExternal");
  assert.ok(completed);
  const completionBody = JSON.parse(completed.body ?? "{}");
  assert.equal(completionBody.channel_id, "C_INCIDENTS");
  assert.match(completionBody.initial_comment, /Environment: preview/);
  assert.doesNotMatch(completionBody.initial_comment, /vercel\.app|vercel\.com/);
});

test("successful deployment sends a concise Slack release notice without the deployment URL", async () => {
  const webhook = "https://hooks.slack.invalid/releases";
  const originalWebhook = process.env.SLACK_WEBHOOK_RELEASES;
  const originalFetch = globalThis.fetch;
  let message = "";
  process.env.SLACK_WEBHOOK_RELEASES = webhook;
  globalThis.fetch = async (input, init) => {
    assert.equal(String(input), webhook);
    message = String(init?.body);
    return new Response("ok");
  };

  try {
    await notifyDeployment(
      {
        action: "vercel.deployment.ready",
        client_payload: {
          id: "dpl_test",
          project: { id: "prj_test", name: "realest" },
          environment: "preview",
          git: { ref: "feature/test", sha: "abcdef1234567890" },
          url: "https://private-preview.vercel.app",
        },
      },
      "prj_test",
    );
  } finally {
    globalThis.fetch = originalFetch;
    if (originalWebhook === undefined) delete process.env.SLACK_WEBHOOK_RELEASES;
    else process.env.SLACK_WEBHOOK_RELEASES = originalWebhook;
  }

  assert.match(message, /Vercel deployment ready/);
  assert.match(message, /Environment: preview/);
  assert.doesNotMatch(message, /private-preview\.vercel\.app/);
});

test("deployment notification fails explicitly when the monitored project ID is missing", async () => {
  await assert.rejects(
    notifyDeployment(
      {
        action: "vercel.deployment.success",
        client_payload: { id: "dpl_test", project: { id: "prj_test" } },
      },
      "",
    ),
    /VERCEL_PROJECT_ID/,
  );
});
