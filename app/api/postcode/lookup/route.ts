import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/supabase/server";
import { consumeRateLimit } from "@/lib/http/rate-limit";
import { lookupNipostPostcode } from "@/lib/postcode/nipost";
import type { OpenApiMetadata } from "@/lib/openapi/route-metadata";

const LOOKUP_LIMIT = 20;
const LOOKUP_WINDOW_MS = 60 * 60 * 1000;

export const openApiGET: OpenApiMetadata = {
  method: "get",
  summary: "Look up a NIPOST postcode",
  description: "Checks one national postcode with the server-side NIPOST key. Each call can spend one credit.",
  tags: ["System"],
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: "code", in: "query", required: true, schema: { type: "string" } },
  ],
  responses: {
    "200": { description: "NIPOST lookup result" },
    "400": { description: "The code is not a NIPOST postcode" },
    "401": { description: "Unauthorized" },
    "402": { description: "NIPOST credits are used up" },
    "422": { description: "NIPOST does not recognise this postcode" },
    "429": { description: "Too many lookups" },
    "503": { description: "NIPOST is not configured" },
  },
};

export async function GET(request: NextRequest) {
  const { data: { user }, error } = await getAuthUser();
  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limit = await consumeRateLimit({
    bucket: "nipost-lookup",
    subject: user.id,
    limit: LOOKUP_LIMIT,
    windowMs: LOOKUP_WINDOW_MS,
  });
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many postcode checks. Try again in an hour" },
      { status: 429 },
    );
  }

  const code = new URL(request.url).searchParams.get("code") ?? "";
  const result = await lookupNipostPostcode(code);
  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: result.status });
  }
  if (!result.lookup.valid) {
    return NextResponse.json({ error: "NIPOST does not recognise this postcode" }, { status: 422 });
  }

  return NextResponse.json(result.lookup);
}
