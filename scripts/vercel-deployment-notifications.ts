import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import sodium from "libsodium-wrappers";

type DeploymentOutcome = "success" | "failure";
type VercelDeploymentPayload = {
  id: string;
  project?: { id?: string; name?: string };
  environment?: string;
  url?: string;
  git?: { ref?: string; sha?: string; shortSha?: string };
};
type RepositoryDispatchEvent = {
  action?: string;
  client_payload?: unknown;
};

const SUCCESS_EVENTS = new Set([
  "vercel.deployment.ready",
  "vercel.deployment.success",
]);
const FAILURE_EVENTS = new Set([
  "vercel.deployment.error",
  "vercel.deployment.failed",
]);
const SENSITIVE_FIELD =
  /(?:secret|token|password|api[_-]?key|private[_-]?key|service[_-]?role[_-]?key|access[_-]?key)/i;
const SENSITIVE_ASSIGNMENT =
  /(["']?[\w.-]*(?:secret|token|password|api[_-]?key|private[_-]?key|service[_-]?role[_-]?key|access[_-]?key)["']?\s*[=:]\s*)("[^"]*"|'[^']*'|[^\s,;]+)/gi;

export function deploymentOutcome(eventType: string | undefined): DeploymentOutcome | null {
  if (typeof eventType !== "string") return null;
  if (SUCCESS_EVENTS.has(eventType)) return "success";
  if (FAILURE_EVENTS.has(eventType)) return "failure";
  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function stringValue(...values: unknown[]): string | undefined {
  return values.find((value): value is string => typeof value === "string" && value.length > 0);
}

function normalizeDeploymentPayload(value: unknown): VercelDeploymentPayload {
  if (!isRecord(value)) {
    throw new Error("Vercel deployment event is missing its payload.");
  }

  const payload = isRecord(value.payload) ? value.payload : value;
  const deployment = isRecord(payload.deployment) ? payload.deployment : {};
  const project = isRecord(payload.project) ? payload.project : {};
  const meta = isRecord(deployment.meta) ? deployment.meta : {};
  const git = isRecord(payload.git) ? payload.git : {};
  const id = stringValue(deployment.id, payload.id);

  if (!id) {
    throw new Error("Vercel deployment event is missing its deployment ID.");
  }

  return {
    id,
    project: {
      id: stringValue(project.id),
      name: stringValue(project.name, deployment.name),
    },
    environment: stringValue(payload.environment, payload.target, deployment.target),
    url: stringValue(payload.url, deployment.url),
    git: {
      ref: stringValue(git.ref, meta.githubCommitRef, meta.gitlabCommitRef, meta.bitbucketCommitRef),
      sha: stringValue(git.sha, meta.githubCommitSha, meta.gitlabCommitSha, meta.bitbucketCommitSha),
      shortSha: stringValue(git.shortSha),
    },
  };
}

function redactValue(
  value: unknown,
  key: string | undefined,
  secretValues: readonly (string | undefined)[],
): unknown {
  if (key && SENSITIVE_FIELD.test(key)) return "[REDACTED]";
  if (typeof value === "string") {
    let redacted = value;
    for (const secret of secretValues) {
      if (secret) redacted = redacted.split(secret).join("[REDACTED]");
    }
    return redacted
      .replace(SENSITIVE_ASSIGNMENT, '$1"[REDACTED]"')
      .replace(/\bBearer\s+[A-Za-z0-9._~+/=-]+/gi, "Bearer [REDACTED]")
      .replace(/\b(?:xox[baprs]-|gh[pousr]_|glpat-|AKIA)[A-Za-z0-9_-]{10,}\b/g, "[REDACTED]")
      .replace(
        /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g,
        "[REDACTED_JWT]",
      )
      .replace(
        /\b([a-z][a-z0-9+.-]*:\/\/[^/\s:@]+:)[^@\s/]+(@)/gi,
        "$1[REDACTED]$2",
      );
  }
  if (Array.isArray(value)) {
    return value.map((item) => redactValue(item, undefined, secretValues));
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([childKey, childValue]) => [
        childKey,
        redactValue(childValue, childKey, secretValues),
      ]),
    );
  }
  return value;
}

export function serializeBuildEvents(
  events: unknown,
  secretValues: readonly (string | undefined)[] = [],
): string {
  if (!Array.isArray(events) || events.length === 0) {
    throw new Error("Vercel returned no build log events.");
  }

  return `${JSON.stringify(redactValue(events, undefined, secretValues), null, 2)}\n`;
}

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function metadataValue(value: unknown): string {
  return String(value ?? "unknown")
    .replace(/[\r\n\t]+/g, " ")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .slice(0, 200);
}

function deploymentMetadata(payload: VercelDeploymentPayload): string {
  const git = payload.git ?? {};
  const sha = typeof git.sha === "string" ? git.sha.slice(0, 12) : "unknown";
  return [
    `Project: ${metadataValue(payload.project?.name)}`,
    `Environment: ${metadataValue(payload.environment)}`,
    `Branch: ${metadataValue(git.ref)}`,
    `Commit: ${metadataValue(sha)}`,
  ].join("\n");
}

async function postSlackWebhook(webhook: string, text: string): Promise<void> {
  const response = await fetch(webhook, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text }),
  });
  const responseText = await response.text();
  if (!response.ok || responseText !== "ok") {
    throw new Error(`Slack webhook failed with HTTP ${response.status}.`);
  }
}

async function getBuildEvents(payload: VercelDeploymentPayload): Promise<unknown[]> {
  const endpoint = new URL(
    `https://api.vercel.com/v3/deployments/${encodeURIComponent(payload.id)}/events`,
  );
  endpoint.searchParams.set("direction", "forward");
  endpoint.searchParams.set("limit", "-1");
  endpoint.searchParams.set("builds", "1");
  endpoint.searchParams.set("delimiter", "1");
  endpoint.searchParams.set("teamId", requiredEnv("VERCEL_TEAM_ID"));

  const response = await fetch(endpoint, {
    headers: { authorization: `Bearer ${requiredEnv("VERCEL_TOKEN")}` },
    signal: AbortSignal.timeout(120_000),
  });
  if (!response.ok) {
    throw new Error(`Vercel build log API failed with HTTP ${response.status}.`);
  }

  const events: unknown = await response.json();
  if (!Array.isArray(events) || events.length === 0) {
    throw new Error("Vercel returned no build log events for the failed deployment.");
  }
  return events;
}

async function slackApi(
  method: string,
  body: Record<string, unknown>,
  accessToken: string,
): Promise<void> {
  const response = await fetch(`https://slack.com/api/${method}`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const result: unknown = await response.json();
  if (!isRecord(result)) {
    throw new Error(`Slack ${method} returned an invalid response.`);
  }
  if (!response.ok) {
    throw new Error(`Slack ${method} failed with HTTP ${response.status}.`);
  }
  if (result.ok !== true) {
    throw new Error(`Slack ${method} failed: ${result.error ?? response.status}.`);
  }
}

async function updateGitHubSecret(name: string, value: string): Promise<void> {
  const [owner, repository, ...extra] = requiredEnv("GITHUB_REPOSITORY").split("/");
  if (!owner || !repository || extra.length > 0) {
    throw new Error("GITHUB_REPOSITORY must contain an owner and repository.");
  }

  const apiUrl = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}/actions/secrets`;
  const headers = {
    accept: "application/vnd.github+json",
    authorization: `Bearer ${requiredEnv("GH_ACTIONS_SECRETS_TOKEN")}`,
    "content-type": "application/json",
    "x-github-api-version": "2022-11-28",
  };
  const keyResponse = await fetch(`${apiUrl}/public-key`, { headers });
  const keyData: unknown = await keyResponse.json();
  if (!keyResponse.ok || !isRecord(keyData)) {
    throw new Error(`Could not get the GitHub Actions secret public key (HTTP ${keyResponse.status}).`);
  }
  if (typeof keyData.key !== "string" || typeof keyData.key_id !== "string") {
    throw new Error("GitHub Actions secret public key response is invalid.");
  }

  await sodium.ready;
  const encryptedValue = sodium.crypto_box_seal(
    sodium.from_string(value),
    sodium.from_base64(keyData.key, sodium.base64_variants.ORIGINAL),
  );
  const response = await fetch(`${apiUrl}/${encodeURIComponent(name)}`, {
    method: "PUT",
    headers,
    body: JSON.stringify({
      encrypted_value: sodium.to_base64(encryptedValue, sodium.base64_variants.ORIGINAL),
      key_id: keyData.key_id,
    }),
  });
  if (!response.ok) {
    throw new Error(`Could not update GitHub Actions secret ${name} (HTTP ${response.status}).`);
  }
}

async function refreshSlackAccessToken(): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  const response = await fetch("https://slack.com/api/oauth.v2.access", {
    method: "POST",
    headers: {
      authorization: `Basic ${Buffer.from(
        `${requiredEnv("SLACK_CLIENT_ID")}:${requiredEnv("SLACK_CLIENT_SECRET")}`,
      ).toString("base64")}`,
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: requiredEnv("SLACK_REFRESH_TOKEN"),
    }),
  });
  const result: unknown = await response.json();
  if (!isRecord(result)) {
    throw new Error("Slack OAuth token refresh returned an invalid response.");
  }
  if (!response.ok || result.ok !== true) {
    throw new Error(`Slack OAuth token refresh failed: ${result.error ?? response.status}.`);
  }
  if (typeof result.access_token !== "string" || typeof result.refresh_token !== "string") {
    throw new Error("Slack OAuth token refresh did not return rotated tokens.");
  }

  await updateGitHubSecret("SLACK_REFRESH_TOKEN", result.refresh_token);
  if (result.token_type !== "bot") {
    throw new Error("Slack OAuth token refresh did not return a bot access token.");
  }
  if (
    typeof result.scope !== "string" ||
    !result.scope.split(",").some((scope) => scope.trim() === "files:write")
  ) {
    throw new Error("Refreshed Slack token is missing the files:write scope.");
  }

  return {
    accessToken: result.access_token,
    refreshToken: result.refresh_token,
  };
}

async function uploadBuildLog(
  payload: VercelDeploymentPayload,
  eventType: string,
  events: unknown[],
  accessToken: string,
  refreshToken: string,
): Promise<void> {
  const filenameParts = [
    payload.project?.name,
    payload.environment,
    payload.git?.shortSha ?? payload.git?.sha?.slice(0, 7),
    "vercel-build-logs.json",
  ];
  const filename = filenameParts
    .filter(Boolean)
    .join("-")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 150);
  const file = Buffer.from(
    serializeBuildEvents(events, [
      process.env.VERCEL_TOKEN,
      process.env.SLACK_CLIENT_SECRET,
      process.env.SLACK_REFRESH_TOKEN,
      process.env.GH_ACTIONS_SECRETS_TOKEN,
      accessToken,
      refreshToken,
      process.env.SLACK_WEBHOOK_INCIDENTS,
      process.env.SLACK_WEBHOOK_RELEASES,
    ]),
    "utf8",
  );

  const uploadRequest = await fetch("https://slack.com/api/files.getUploadURLExternal", {
    method: "POST",
    headers: {
      authorization: `Bearer ${accessToken}`,
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      filename,
      length: String(file.byteLength),
    }),
  });
  const uploadData: unknown = await uploadRequest.json();
  if (!isRecord(uploadData)) {
    throw new Error("Slack files.getUploadURLExternal returned an invalid response.");
  }
  if (!uploadRequest.ok || uploadData.ok !== true) {
    throw new Error(
      `Slack files.getUploadURLExternal failed: ${uploadData.error ?? uploadRequest.status}.`,
    );
  }
  if (typeof uploadData.upload_url !== "string" || typeof uploadData.file_id !== "string") {
    throw new Error("Slack files.getUploadURLExternal returned an invalid upload response.");
  }

  const uploadResponse = await fetch(uploadData.upload_url, {
    method: "POST",
    headers: { "content-type": "application/octet-stream" },
    body: file,
  });
  if (!uploadResponse.ok) {
    throw new Error(`Slack file transfer failed with HTTP ${uploadResponse.status}.`);
  }

  await slackApi("files.completeUploadExternal", {
    files: [{ id: uploadData.file_id, title: filename }],
    channel_id: requiredEnv("SLACK_CHANNEL_INCIDENTS"),
    initial_comment: [
      `Vercel deployment failed (${metadataValue(eventType)}).`,
      deploymentMetadata(payload),
      "The attached JSON contains the available Vercel build events. Review it in the restricted incident channel; logs can contain sensitive build output.",
    ].join("\n"),
  }, accessToken);
}

export async function notifyDeployment(
  event: RepositoryDispatchEvent,
  projectId = process.env.VERCEL_PROJECT_ID,
): Promise<void> {
  const eventType = event.action;
  const outcome = deploymentOutcome(eventType);
  if (!outcome || !eventType) return;

  if (!projectId) {
    throw new Error("Missing required environment variable: VERCEL_PROJECT_ID");
  }
  const payload = normalizeDeploymentPayload(event.client_payload);
  if (!payload.project?.id) {
    throw new Error("Vercel deployment event is missing its project ID.");
  }
  if (payload.project.id !== projectId) {
    console.log("Ignoring Vercel dispatch for a project that is not configured.");
    return;
  }

  const metadata = deploymentMetadata(payload);
  if (outcome === "success") {
    await postSlackWebhook(
      requiredEnv("SLACK_WEBHOOK_RELEASES"),
      `Vercel deployment ready\n${metadata}`,
    );
    return;
  }

  try {
    const events = await getBuildEvents(payload);
    const { accessToken, refreshToken } = await refreshSlackAccessToken();
    await uploadBuildLog(payload, eventType, events, accessToken, refreshToken);
  } catch (error) {
    const details = error instanceof Error ? error.message : "Unknown log collection error.";
    try {
      await postSlackWebhook(
        requiredEnv("SLACK_WEBHOOK_INCIDENTS"),
        `Vercel deployment failed, but its build log could not be collected.\n${metadata}\nCollection error: ${metadataValue(details)}`,
      );
    } catch (notificationError) {
      console.error("Could not send the fallback Slack incident notification:", notificationError);
    }
    throw error;
  }
}

async function main() {
  const eventPath = requiredEnv("GITHUB_EVENT_PATH");
  const event: RepositoryDispatchEvent = JSON.parse(await readFile(eventPath, "utf8"));
  event.action = process.env.GITHUB_EVENT_ACTION ?? event.action;
  await notifyDeployment(event);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error("Vercel deployment notification failed:", error);
    process.exitCode = 1;
  });
}
