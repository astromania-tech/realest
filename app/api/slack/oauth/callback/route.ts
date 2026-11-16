import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { updateGitHubActionsSecret } from "@/lib/github/actions-secrets";
import type { OpenApiMetadata } from "@/lib/openapi/route-metadata";
import {
  exchangeSlackAuthorizationCode,
  hasMatchingSlackOAuthState,
  isSlackOAuthProductionRequest,
  parseSlackOAuthGrant,
  SLACK_OAUTH_STATE_COOKIE,
} from "@/lib/slack/oauth-install";

const GITHUB_OWNER = "astromania-tech";
const GITHUB_REPOSITORY = "realest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const openApiGET: OpenApiMetadata = {
  method: "get",
  summary: "Complete Slack workspace authorization",
  description:
    "Validates the Slack OAuth state, verifies the configured workspace and files:write scope, then stores the rotated refresh token as a GitHub Actions secret. Requires a signed-in RealEST admin session.",
  tags: ["Slack OAuth"],
  servers: [{ url: "https://app.realest.ng" }],
  parameters: [
    {
      name: "code",
      in: "query",
      required: true,
      description: "Short-lived authorization code returned by Slack.",
      schema: { type: "string" },
    },
    {
      name: "state",
      in: "query",
      required: true,
      description: "One-time state value issued by the Slack OAuth start endpoint.",
      schema: { type: "string" },
    },
  ],
  responses: {
    "200": {
      description: "Slack authorization completed and refresh token saved",
      content: { "text/plain": { schema: { type: "string" } } },
    },
    "400": { description: "Authorization was denied or state/code is invalid" },
    "401": { description: "Sign in as a RealEST admin" },
    "403": { description: "RealEST admin access required" },
    "404": { description: "Available only on the production app domain" },
    "502": { description: "Slack authorization or GitHub secret update failed" },
    "500": { description: "Slack OAuth setup is not configured" },
  },
};

function callbackResponse(
  message: string,
  status: number,
  clearState = false,
): NextResponse {
  const response = new NextResponse(message, {
    status,
    headers: {
      "cache-control": "no-store, max-age=0",
      "content-type": "text/plain; charset=utf-8",
      "referrer-policy": "no-referrer",
      "x-content-type-options": "nosniff",
      "content-security-policy": "default-src 'none'; frame-ancestors 'none'",
    },
  });
  if (clearState) {
    response.cookies.set(SLACK_OAUTH_STATE_COOKIE, "", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/api/slack/oauth",
      maxAge: 0,
    });
  }
  return response;
}

export async function GET(request: NextRequest) {
  if (
    !isSlackOAuthProductionRequest(
      request.nextUrl.origin,
      process.env.VERCEL_ENV,
    )
  ) {
    return callbackResponse("Not found.", 404);
  }

  const url = request.nextUrl;
  const state = url.searchParams.get("state");
  const stateCookie = request.cookies.get(SLACK_OAUTH_STATE_COOKIE)?.value;
  if (!hasMatchingSlackOAuthState(state, stateCookie)) {
    return callbackResponse(
      "Slack authorization could not be verified. Start the setup again.",
      400,
      true,
    );
  }

  const admin = await requireAdmin();
  if (!admin.ok) {
    return callbackResponse(admin.error, admin.status, true);
  }

  if (url.searchParams.has("error")) {
    return callbackResponse(
      "Slack authorization was cancelled. Start the setup again if you want to continue.",
      400,
      true,
    );
  }

  const code = url.searchParams.get("code");
  if (!code || code.length > 4096) {
    return callbackResponse(
      "Slack did not return a valid authorization code. Start the setup again.",
      400,
      true,
    );
  }

  const clientId = process.env.SLACK_CLIENT_ID;
  const clientSecret = process.env.SLACK_CLIENT_SECRET;
  const workspaceId = process.env.SLACK_WORKSPACE_ID;
  const githubToken = process.env.GH_ACTIONS_SECRETS_TOKEN;
  if (
    !clientId ||
    !clientSecret ||
    !workspaceId ||
    !githubToken
  ) {
    return callbackResponse(
      "Slack OAuth setup is incomplete. Contact the repository administrator.",
      500,
      true,
    );
  }

  try {
    const result = await exchangeSlackAuthorizationCode(
      code,
      clientId,
      clientSecret,
    );
    const grant = parseSlackOAuthGrant(result, workspaceId);
    await updateGitHubActionsSecret({
      owner: GITHUB_OWNER,
      repository: GITHUB_REPOSITORY,
      name: "SLACK_REFRESH_TOKEN",
      value: grant.refreshToken,
      token: githubToken,
    });

    return callbackResponse(
      `Slack is connected to ${grant.teamName ?? "your workspace"}. The refresh token was saved. You can close this page.`,
      200,
      true,
    );
  } catch (error) {
    console.error(
      "[Slack OAuth callback] Setup failed:",
      error instanceof Error ? error.message : "Unknown error",
    );
    return callbackResponse(
      "Slack setup did not finish. Start the authorization again and contact the repository administrator if it keeps failing.",
      502,
      true,
    );
  }
}
