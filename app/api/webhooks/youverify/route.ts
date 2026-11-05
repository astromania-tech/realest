import { NextResponse } from "next/server";
import { youverifySignatureValid } from "@/lib/kyc/signature";
import { prismaKycStore } from "@/lib/kyc/store";
import { applyYouverifyWebhook } from "@/lib/kyc/webhook";

/**
 * Youverify calls this when a pending identity check finishes.
 * The signature is HMAC-SHA256 of the raw body in x-yv-signature.
 * A valid event updates an existing pending row. It never inserts an approved row.
 */
export async function POST(request: Request) {
  const secret = process.env.YOUVERIFY_SECRET_KEY ?? "";
  const raw = await request.text();
  const header = request.headers.get("x-yv-signature");
  if (!youverifySignatureValid(raw, header, secret)) {
    return new NextResponse(null, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: true });
  }

  try {
    await applyYouverifyWebhook(payload, prismaKycStore);
  } catch (error) {
    console.error("Youverify webhook failed to update kyc_requests", error instanceof Error ? error.name : "error");
    return NextResponse.json({ error: "Could not save the Youverify result." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
