import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";
import {
  inviteStaff,
  knownNigerianStateNames,
  listInvitedStaff,
  lgasForStateName,
} from "@/lib/auth/invite-staff";
import { readStaffOpsLocation } from "@/lib/trust/officer-ops";
import type { OpenApiMetadata } from "@/lib/openapi/route-metadata";

export const openApiGET: OpenApiMetadata = {
  method: "get",
  summary: "List verification staff",
  description: "List reviewers and field staff invited by admins.",
  tags: ["Admin"],
  security: [{ bearerAuth: [] }],
  responses: {
    "200": { description: "Staff list" },
    "401": { description: "Unauthorized" },
    "403": { description: "Forbidden" },
  },
};

export const openApiPOST: OpenApiMetadata = {
  method: "post",
  summary: "Invite verification staff",
  description:
    "Create or promote a staff account with operating state/LGA and email a password setup link.",
  tags: ["Admin"],
  security: [{ bearerAuth: [] }],
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          required: ["email", "full_name", "role", "state", "lga"],
          properties: {
            email: { type: "string", format: "email" },
            full_name: { type: "string" },
            role: {
              type: "string",
              enum: ["reviewer", "supervisor", "team_leader", "team_member"],
            },
            state: { type: "string" },
            lga: { type: "string" },
          },
        },
      },
    },
  },
  responses: {
    "200": { description: "Invitation sent" },
    "400": { description: "Invalid input" },
    "401": { description: "Unauthorized" },
    "403": { description: "Forbidden" },
    "409": { description: "Already has this role or is admin" },
    "500": { description: "Invite failed" },
  },
};

export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const { searchParams } = new URL(request.url);
  const state = searchParams.get("state");
  if (state) {
    return NextResponse.json({
      states: knownNigerianStateNames(),
      lgas: lgasForStateName(state),
    });
  }

  const staff = await listInvitedStaff();
  return NextResponse.json({
    staff: staff.map((person) => {
      const ops = readStaffOpsLocation(person);
      return {
        id: person.id,
        full_name: person.full_name,
        email: person.email,
        role: person.role,
        created_at: person.created_at,
        is_active: person.is_active,
        state: ops?.state ?? null,
        lga: ops?.lga ?? null,
      };
    }),
    states: knownNigerianStateNames(),
  });
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const body = (await request.json().catch(() => null)) as {
    email?: string;
    full_name?: string;
    role?: string;
    state?: string;
    lga?: string;
  } | null;

  if (!body?.email || !body?.full_name || !body?.role || !body?.state || !body?.lga) {
    return NextResponse.json(
      { error: "email, full_name, role, state, and lga are required." },
      { status: 400 },
    );
  }

  const actorProfile = await prisma.profiles.findUnique({
    where: { id: admin.userId },
    select: { full_name: true },
  });

  const result = await inviteStaff({
    actorId: admin.userId,
    actorName: actorProfile?.full_name ?? "RealEST Admin",
    email: body.email,
    fullName: body.full_name,
    role: body.role,
    state: body.state,
    lga: body.lga,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    success: true,
    user_id: result.userId,
    mode: result.mode,
  });
}
