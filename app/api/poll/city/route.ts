import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  let answer: string;
  let ref: string;

  try {
    const body = await request.json();
    answer = (body.answer ?? "").toString().trim().slice(0, 100);
    ref = (body.ref ?? "").toString().trim().slice(0, 100);
  } catch {
    return NextResponse.json({ success: false, error: "Invalid body" }, { status: 400 });
  }

  if (!answer) {
    return NextResponse.json({ success: false, error: "answer is required" }, { status: 400 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    null;

  // Best-effort insert — table may not exist yet; never block the user experience.
  try {
    await prisma.poll_responses.create({
      data: {
        question_key: "city",
        answer,
        ref: ref || null,
        ip_address: ip,
      },
    });
  } catch {
    // Silently swallow — poll storage is non-critical.
  }

  return NextResponse.json({ success: true });
}
