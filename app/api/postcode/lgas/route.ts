import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/supabase/server";
import { listNipostLgas, listNipostStates, matchNipostState } from "@/lib/postcode/reference";
import type { OpenApiMetadata } from "@/lib/openapi/route-metadata";

export const openApiGET: OpenApiMetadata = {
  method: "get",
  summary: "List NIPOST local government areas for a state",
  description: "Returns the official LGA names for a state the owner selected. This catalog call does not spend a lookup credit.",
  tags: ["System"],
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: "state", in: "query", required: true, schema: { type: "string" } },
  ],
  responses: {
    "200": { description: "Official LGAs" },
    "400": { description: "Unknown state" },
    "401": { description: "Unauthorized" },
    "503": { description: "NIPOST is not configured" },
  },
};

export async function GET(request: NextRequest) {
  const { data: { user }, error } = await getAuthUser();
  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stateName = new URL(request.url).searchParams.get("state") ?? "";
  const states = await listNipostStates();
  if (!states.ok) {
    return NextResponse.json({ error: states.message }, { status: states.status });
  }
  const state = matchNipostState(stateName, states.states);
  if (!state) {
    return NextResponse.json({ error: "Choose a Nigerian state" }, { status: 400 });
  }
  const lgas = await listNipostLgas(state.code);
  if (!lgas.ok) {
    return NextResponse.json({ error: lgas.message }, { status: lgas.status });
  }

  return NextResponse.json({
    stateCode: state.code,
    stateName: state.name,
    lgas: lgas.lgas,
  });
}
