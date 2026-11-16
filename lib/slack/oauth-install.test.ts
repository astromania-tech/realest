import assert from "node:assert/strict";
import sodium from "libsodium-wrappers";
import test from "node:test";
import { updateGitHubActionsSecret } from "../github/actions-secrets";
import {
  buildSlackAuthorizationUrl,
  exchangeSlackAuthorizationCode,
  hasMatchingSlackOAuthState,
  isSlackOAuthProductionRequest,
  parseSlackOAuthGrant,
  SLACK_OAUTH_REDIRECT_URI,
} from "./oauth-install";
import { isRouteAccessible } from "../appMode";

test("Slack authorization requests only the required bot scope and fixed production callback", () => {
  const url = buildSlackAuthorizationUrl("client-id", "T123456", "random-state");

  assert.equal(url.origin, "https://slack.com");
  assert.equal(url.pathname, "/oauth/v2/authorize");
  assert.equal(url.searchParams.get("client_id"), "client-id");
  assert.equal(url.searchParams.get("scope"), "files:write");
  assert.equal(url.searchParams.get("team"), "T123456");
  assert.equal(url.searchParams.get("state"), "random-state");
  assert.equal(url.searchParams.get("redirect_uri"), SLACK_OAUTH_REDIRECT_URI);
});

test("Slack OAuth state comparison rejects missing, altered, and unequal-length values", () => {
  assert.equal(hasMatchingSlackOAuthState("same-state", "same-state"), true);
  assert.equal(hasMatchingSlackOAuthState("different", "same-state"), false);
  assert.equal(hasMatchingSlackOAuthState("short", "longer"), false);
  assert.equal(hasMatchingSlackOAuthState(null, "same-state"), false);
  assert.equal(hasMatchingSlackOAuthState("same-state", undefined), false);
});

test("Slack OAuth endpoints are restricted to the production app origin", () => {
  assert.equal(isSlackOAuthProductionRequest("https://app.realest.ng", "production"), true);
  assert.equal(isSlackOAuthProductionRequest("https://dev.realest.ng", "production"), false);
  assert.equal(isSlackOAuthProductionRequest("https://app.realest.ng", "preview"), false);
  assert.equal(isSlackOAuthProductionRequest("http://app.realest.ng", "production"), false);
});

test("OAuth setup routes remain reachable in coming-soon mode for their admin-guarded handlers", () => {
  const previousMode = process.env.NEXT_PUBLIC_APP_MODE;
  process.env.NEXT_PUBLIC_APP_MODE = "coming-soon";
  try {
    assert.equal(isRouteAccessible("/api/slack/oauth/start"), true);
    assert.equal(isRouteAccessible("/api/slack/oauth/callback"), true);
  } finally {
    if (previousMode === undefined) delete process.env.NEXT_PUBLIC_APP_MODE;
    else process.env.NEXT_PUBLIC_APP_MODE = previousMode;
  }
});

test("Slack grant must be a bot token with files:write for the configured workspace", () => {
  const grant = parseSlackOAuthGrant(
    {
      ok: true,
      token_type: "bot",
      refresh_token: "rotated-refresh-token",
      scope: "commands,files:write",
      team: { id: "T123456", name: "RealEST workspace" },
    },
    "T123456",
  );

  assert.equal(grant.refreshToken, "rotated-refresh-token");
  assert.equal(grant.teamId, "T123456");
  assert.equal(grant.teamName, "RealEST workspace");
  assert.deepEqual(grant.scopes, ["commands", "files:write"]);
  assert.throws(
    () =>
      parseSlackOAuthGrant(
        {
          ok: true,
          token_type: "bot",
          refresh_token: "refresh-token",
          scope: "commands",
          team: { id: "T123456" },
        },
        "T123456",
      ),
    /missing files:write/,
  );
  assert.throws(
    () =>
      parseSlackOAuthGrant(
        {
          ok: true,
          token_type: "bot",
          refresh_token: "refresh-token",
          scope: "files:write",
          team: { id: "T654321" },
        },
        "T123456",
      ),
    /different workspace/,
  );
});

test("OAuth code exchange uses the fixed callback and secret persistence encrypts the refresh token", async () => {
  await sodium.ready;
  const keyPair = sodium.crypto_box_keypair();
  const requests: { url: string; init?: RequestInit }[] = [];
  const fetcher: typeof fetch = async (input, init) => {
    const url = String(input);
    requests.push({ url, init });
    if (url === "https://slack.com/api/oauth.v2.access") {
      return new Response(
        JSON.stringify({
          ok: true,
          token_type: "bot",
          refresh_token: "one-time-rotated-value",
          scope: "files:write",
          team: { id: "T123456", name: "RealEST workspace" },
        }),
        { headers: { "content-type": "application/json" } },
      );
    }
    if (url.endsWith("/actions/secrets/public-key")) {
      return new Response(
        JSON.stringify({
          key: sodium.to_base64(keyPair.publicKey, sodium.base64_variants.ORIGINAL),
          key_id: "key-id",
        }),
        { headers: { "content-type": "application/json" } },
      );
    }
    if (url.endsWith("/actions/secrets/SLACK_REFRESH_TOKEN")) {
      return new Response(null, { status: 204 });
    }
    throw new Error(`Unexpected request: ${url}`);
  };

  const response = await exchangeSlackAuthorizationCode(
    "one-time-code",
    "client-id",
    "client-secret",
    fetcher,
  );
  const grant = parseSlackOAuthGrant(response, "T123456");
  await updateGitHubActionsSecret({
    owner: "astromania-tech",
    repository: "realest",
    name: "SLACK_REFRESH_TOKEN",
    value: grant.refreshToken,
    token: "github-token",
    fetcher,
  });

  const exchangeRequest = requests.find((request) =>
    request.url === "https://slack.com/api/oauth.v2.access",
  );
  assert.ok(exchangeRequest);
  const body = new URLSearchParams(String(exchangeRequest.init?.body));
  assert.equal(body.get("client_id"), "client-id");
  assert.equal(body.get("client_secret"), "client-secret");
  assert.equal(body.get("code"), "one-time-code");
  assert.equal(body.get("redirect_uri"), SLACK_OAUTH_REDIRECT_URI);

  const secretRequest = requests.find((request) =>
    request.url.endsWith("/actions/secrets/SLACK_REFRESH_TOKEN"),
  );
  assert.ok(secretRequest);
  assert.equal(secretRequest.init?.method, "PUT");
  const secretBody = JSON.parse(String(secretRequest.init?.body)) as {
    encrypted_value: string;
    key_id: string;
  };
  assert.equal(secretBody.key_id, "key-id");
  const decrypted = sodium.crypto_box_seal_open(
    sodium.from_base64(secretBody.encrypted_value, sodium.base64_variants.ORIGINAL),
    keyPair.publicKey,
    keyPair.privateKey,
  );
  assert.equal(sodium.to_string(decrypted), "one-time-rotated-value");
  assert.doesNotMatch(JSON.stringify(secretRequest.init?.body), /one-time-rotated-value/);
});
