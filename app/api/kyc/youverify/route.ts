import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { supabaseIdImageSaver } from "@/lib/kyc/id-image-store";
import { prismaKycStore } from "@/lib/kyc/store";
import { submitYouverifyIdentity } from "@/lib/kyc/submit";
import type { OpenApiMetadata } from "@/lib/openapi/route-metadata";

const bodySchema = z.object({
  idType: z.enum(["nin", "bvn", "cac"]),
  idNumber: z.string().trim().min(5).max(20),
  consent: z.literal(true),
  firstName: z.string().trim().max(80).optional(),
  lastName: z.string().trim().max(80).optional(),
  dateOfBirth: z.string().trim().max(40).optional(),
  companyName: z.string().trim().max(160).optional(),
  idImageBase64: z.string().trim().max(2_000_000).optional(),
});

export const openApiPOST: OpenApiMetadata = {
  method: "post",
  summary: "Verify identity with Youverify",
  description:
    "An owner submits NIN or BVN with the first name, last name, date of birth, and a photo of the face on that ID. An agent submits a CAC number with the registered company name. An approved owner row requires the typed details and the ID photo to match the Youverify record. The photo is not stored.",
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
            firstName: { type: "string" },
            lastName: { type: "string" },
            dateOfBirth: { type: "string" },
            companyName: { type: "string" },
            idImageBase64: { type: "string", description: "JPEG, PNG, or WebP of the face on the ID, max 1 MB." },
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
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      dateOfBirth: parsed.data.dateOfBirth,
      companyName: parsed.data.companyName,
      idImageBase64: parsed.data.idImageBase64,
    },
    { store: prismaKycStore, saveIdImage: supabaseIdImageSaver(), env: {
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
