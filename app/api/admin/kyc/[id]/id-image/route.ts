import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { openKycIdImage, signKycIdImage } from "@/lib/kyc/id-image-store";
import { readStoredDocuments } from "@/lib/kyc/store";
import { YOUVERIFY_PROVIDER } from "@/lib/kyc/types";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = await requireAdmin();
  const row = await prisma.kyc_requests.findUnique({
    where: { id },
    select: { documents: true, kyc_provider: true },
  });
  const documents = row?.kyc_provider === YOUVERIFY_PROVIDER ? readStoredDocuments(row.documents) : null;
  const opened = await openKycIdImage({
    admin,
    idImagePath: documents?.idImagePath ?? null,
    sign: signKycIdImage,
  });
  if (!opened.ok) {
    return NextResponse.json({ error: opened.error }, { status: opened.status });
  }
  return NextResponse.redirect(opened.url);
}
