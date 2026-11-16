import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import type { OpenApiMetadata } from "@/lib/openapi/route-metadata";
import {
  buildSlackAuthorizationUrl,
  isSlackOAuthProductionRequest,
  SLACK_OAUTH_STATE_COOKIE,
} from "@/lib/slack/oauth-install";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const openApiGET: OpenApiMetadata = {
  method: "get",
  summary: "Start Slack workspace authorization",
  description:
    "Admin-only setup flow. Redirects to Slack to grant files:write for the configured workspace. This endpoint is enabled only on the production app domain.",
  tags: ["Slack OAuth"],
  servers: [{ url: "https://app.realest.ng" }],
  responses: {
    "302": { description: "Redirect to Slack authorization" },
    "401": { description: "Sign in as a RealEST admin" },
    "403": { description: "RealEST admin access required" },
    "404": { description: "Available only on the production app domain" },
    "500": { description: "Slack OAuth setup is not configured" },
  },
};

export async function GET(request: NextRequest) {
  if (
    !isSlackOAuthProductionRequest(
      request.nextUrl.origin,
      process.env.VERCEL_ENV,
    )
  ) {
    return new NextResponse("Not found.", { status: 404 });
  }

  const admin = await requireAdmin();
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const clientId = process.env.SLACK_CLIENT_ID;
  const teamId = process.env.SLACK_WORKSPACE_ID;
  if (!clientId || !teamId || !/^T[A-Z0-9]+$/.test(teamId)) {
    return NextResponse.json(
      { error: "Slack OAuth setup is not configured." },
      { status: 500 },
    );
  }

  const state = randomBytes(32).toString("base64url");
  const response = NextResponse.redirect(
    buildSlackAuthorizationUrl(clientId, teamId, state),
  );
  response.cookies.set(SLACK_OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/api/slack/oauth",
    maxAge: 600,
  });
  response.headers.set("cache-control", "no-store");
  response.headers.set("referrer-policy", "no-referrer");
  return response;
}
