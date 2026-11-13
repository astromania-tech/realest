import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

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
  client_payload?: VercelDeploymentPayload;
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
): Promise<void> {
  const response = await fetch(`https://slack.com/api/${method}`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${requiredEnv("SLACK_BOT_TOKEN")}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const result: unknown = await response.json();
  if (!isRecord(result)) {
    throw new Error(`Slack ${method} returned an invalid response.`);
  }
  if (result.ok !== true) {
    throw new Error(`Slack ${method} failed: ${result.error ?? response.status}.`);
  }
  if (!response.ok) {
    throw new Error(`Slack ${method} failed with HTTP ${response.status}.`);
  }
}

async function uploadBuildLog(
  payload: VercelDeploymentPayload,
  eventType: string,
  events: unknown[],
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
      process.env.SLACK_BOT_TOKEN,
      process.env.SLACK_WEBHOOK_INCIDENTS,
      process.env.SLACK_WEBHOOK_RELEASES,
    ]),
    "utf8",
  );

  const uploadRequest = await fetch("https://slack.com/api/files.getUploadURLExternal", {
    method: "POST",
    headers: {
      authorization: `Bearer ${requiredEnv("SLACK_BOT_TOKEN")}`,
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
  });
}

export async function notifyDeployment(
  event: RepositoryDispatchEvent,
  projectId = process.env.VERCEL_PROJECT_ID,
): Promise<void> {
  const eventType = event.action;
  const outcome = deploymentOutcome(eventType);
  if (!outcome || !eventType) return;

  const payload = event.client_payload;
  if (!projectId) {
    throw new Error("Missing required environment variable: VERCEL_PROJECT_ID");
  }
  if (!payload || !payload.project?.id) {
    throw new Error("Vercel deployment event is missing its project ID.");
  }
  if (payload.project.id !== projectId) {
    console.log("Ignoring Vercel dispatch for a project that is not configured.");
    return;
  }
  if (typeof payload.id !== "string" || !payload.id) {
    throw new Error("Vercel deployment event is missing its deployment ID.");
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
    await uploadBuildLog(payload, eventType, events);
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
