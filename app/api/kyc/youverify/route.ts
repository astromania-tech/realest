import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { prismaKycStore } from "@/lib/kyc/store";
import { submitYouverifyIdentity } from "@/lib/kyc/submit";
import type { OpenApiMetadata } from "@/lib/openapi/route-metadata";

const bodySchema = z.object({
  idType: z.enum(["nin", "bvn", "cac"]),
  idNumber: z.string().trim().min(5).max(20),
  consent: z.literal(true),
});

export const openApiPOST: OpenApiMetadata = {
  method: "post",
  summary: "Verify identity with Youverify",
  description:
    "An owner submits NIN or BVN. An agent submits a CAC registration number. The result is written to kyc_requests. An approved row is created only when Youverify reports the record found.",
  tags: ["KYC"],
  security: [{ bearerAuth: [] }],
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          required: ["idType", "idNumber", "consent"],
          properties: {
            idType: { type: "string", enum: ["nin", "bvn", "cac"] },
            idNumber: { type: "string" },
            consent: { type: "boolean", enum: [true] },
          },
        },
      },
    },
  },
  responses: {
    "201": { description: "Youverify result saved" },
    "200": { description: "An approved Youverify row already exists" },
    "400": { description: "Identity number, consent, or id type does not match the role" },
    "401": { description: "Unauthorized" },
    "403": { description: "Only an owner or an agent can verify identity" },
    "502": { description: "Youverify did not return a result. No row was approved." },
    "503": { description: "Youverify is not configured" },
  },
};

export async function POST(request: Request) {
  const {
    data: { user },
    error: authError,
  } = await getAuthUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userRow = await prisma.users.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid identity payload." }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid identity payload." }, { status: 400 });
  }

  const result = await submitYouverifyIdentity(
    {
      userId: user.id,
      role: userRow?.role,
      idType: parsed.data.idType,
      idNumber: parsed.data.idNumber,
      consent: parsed.data.consent,
    },
    { store: prismaKycStore, env: {
      YOUVERIFY_BASE_URL: process.env.YOUVERIFY_BASE_URL,
      YOUVERIFY_SECRET_KEY: process.env.YOUVERIFY_SECRET_KEY,
    } },
  );

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json(
    {
      status: result.status,
      kycRequestId: result.kycRequestId,
      personBadge: result.personBadge,
      reason: result.reason,
    },
    { status: result.created ? 201 : 200 },
  );
}
