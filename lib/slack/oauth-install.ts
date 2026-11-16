import { timingSafeEqual } from "node:crypto";

export const SLACK_OAUTH_REDIRECT_URI =
  "https://app.realest.ng/api/slack/oauth/callback";
export const SLACK_OAUTH_PRODUCTION_ORIGIN = "https://app.realest.ng";
export const SLACK_OAUTH_STATE_COOKIE = "__Secure-slack-oauth-state";
export const SLACK_OAUTH_REQUIRED_SCOPE = "files:write";

type SlackOAuthGrant = {
  refreshToken: string;
  teamId: string;
  teamName?: string;
  scopes: string[];
};

type SlackOAuthResponse = {
  ok?: unknown;
  error?: unknown;
  refresh_token?: unknown;
  token_type?: unknown;
  scope?: unknown;
  team?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function buildSlackAuthorizationUrl(
  clientId: string,
  teamId: string,
  state: string,
): URL {
  const url = new URL("https://slack.com/oauth/v2/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("scope", SLACK_OAUTH_REQUIRED_SCOPE);
  url.searchParams.set("redirect_uri", SLACK_OAUTH_REDIRECT_URI);
  url.searchParams.set("team", teamId);
  url.searchParams.set("state", state);
  return url;
}

export function isSlackOAuthProductionRequest(
  origin: string,
  vercelEnvironment: string | undefined,
): boolean {
  return origin === SLACK_OAUTH_PRODUCTION_ORIGIN &&
    vercelEnvironment === "production";
}

export function hasMatchingSlackOAuthState(
  received: string | null,
  expected: string | undefined,
): boolean {
  if (!received || !expected || received.length > 128 || expected.length > 128) {
    return false;
  }
  const receivedBytes = Buffer.from(received);
  const expectedBytes = Buffer.from(expected);
  return receivedBytes.length === expectedBytes.length &&
    timingSafeEqual(receivedBytes, expectedBytes);
}

export function parseSlackOAuthGrant(
  value: unknown,
  expectedTeamId: string,
): SlackOAuthGrant {
  if (!isRecord(value) || value.ok !== true) {
    throw new Error("Slack authorization did not return a successful response.");
  }

  const response = value as SlackOAuthResponse;
  if (response.token_type !== "bot") {
    throw new Error("Slack authorization did not return a bot token.");
  }
  if (typeof response.refresh_token !== "string" || !response.refresh_token) {
    throw new Error("Slack authorization did not return a refresh token.");
  }
  if (typeof response.scope !== "string") {
    throw new Error("Slack authorization did not return granted bot scopes.");
  }

  const scopes = response.scope.split(",").map((scope) => scope.trim()).filter(Boolean);
  if (!scopes.includes(SLACK_OAUTH_REQUIRED_SCOPE)) {
    throw new Error("The approved Slack bot token is missing files:write.");
  }
  if (!isRecord(response.team) || typeof response.team.id !== "string") {
    throw new Error("Slack authorization did not identify a workspace.");
  }
  if (response.team.id !== expectedTeamId) {
    throw new Error("The Slack authorization was completed for a different workspace.");
  }

  return {
    refreshToken: response.refresh_token,
    teamId: response.team.id,
    teamName: typeof response.team.name === "string" ? response.team.name : undefined,
    scopes,
  };
}

export async function exchangeSlackAuthorizationCode(
  code: string,
  clientId: string,
  clientSecret: string,
  fetcher: typeof fetch = fetch,
): Promise<unknown> {
  const response = await fetcher("https://slack.com/api/oauth.v2.access", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: SLACK_OAUTH_REDIRECT_URI,
    }),
    signal: AbortSignal.timeout(20_000),
  });

  let result: unknown;
  try {
    result = await response.json();
  } catch {
    throw new Error("Slack authorization returned an invalid response.");
  }

  if (!response.ok || !isRecord(result) || result.ok !== true) {
    throw new Error(`Slack authorization code exchange failed (HTTP ${response.status}).`);
  }
  return result;
}
