import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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

  assert.equal(deploymentOutcome("vercel.deployment.ready"), "success");
  assert.equal(deploymentOutcome("vercel.deployment.success"), "success");
  assert.equal(deploymentOutcome("vercel.deployment.error"), "failure");
  assert.equal(deploymentOutcome("vercel.deployment.failed"), "failure");
  assert.equal(deploymentOutcome("vercel.deployment.canceled"), null);
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
    SLACK_BOT_TOKEN: "slack-token-test",
    SLACK_WEBHOOK_INCIDENTS: "https://hooks.slack.invalid/incidents",
    SLACK_WEBHOOK_RELEASES: "https://hooks.slack.invalid/releases",
    SLACK_CHANNEL_INCIDENTS: "C_INCIDENTS",
  };
  const previousEnv = Object.fromEntries(
    Object.keys(env).map((key) => [key, process.env[key]]),
  );
  const originalFetch = globalThis.fetch;
  const requests: { url: URL; init?: RequestInit; body?: string }[] = [];

  for (const [key, value] of Object.entries(env)) process.env[key] = value;
  globalThis.fetch = async (input, init) => {
    const url = new URL(input instanceof Request ? input.url : String(input));
    const request: (typeof requests)[number] = { url, init };
    requests.push(request);
    if (url.hostname === "api.vercel.com") {
      return new Response(
        JSON.stringify([{ type: "stderr", text: "TOKEN=build-secret-value" }]),
        { headers: { "content-type": "application/json" } },
      );
    }
    if (url.pathname === "/api/files.getUploadURLExternal") {
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
          id: "dpl_test",
          project: { id: "prj_test", name: "realest" },
          environment: "preview",
          git: { ref: "feature/test", sha: "abcdef1234567890" },
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
  assert.equal(vercelRequest.url.searchParams.get("limit"), "-1");
  assert.equal(vercelRequest.url.searchParams.get("builds"), "1");
  assert.equal(vercelRequest.url.searchParams.get("teamId"), "team_test");

  const uploaded = requests.find((request) => request.url.hostname === "upload.slack.invalid");
  assert.ok(uploaded?.body);
  assert.match(uploaded.body, /stderr/);
  assert.doesNotMatch(uploaded.body, /build-secret-value/);
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
