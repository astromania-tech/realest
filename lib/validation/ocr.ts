import sharp from "sharp";

export type ValidationExtractionMetadata = {
  pageCount: number;
  width?: number;
  height?: number;
  format: string;
  hasExif: boolean;
  location: { lat: number; lng: number } | null;
};

export type ValidationExtractionResult = {
  text: string;
  confidence: number;
  metadata: ValidationExtractionMetadata;
};

function normalizeText(value: string): string {
  return value.replace(/\u0000/g, " ").replace(/\s+/g, " ").trim();
}

async function extractPdfText(buffer: Buffer): Promise<ValidationExtractionResult> {
  const pdfParseModule = await import("pdf-parse");
  const pdfParse = (pdfParseModule as unknown as { default: (input: Buffer) => Promise<{ text: string; numpages?: number }> }).default;
  const parsed = await pdfParse(buffer);
  const text = normalizeText(parsed.text ?? "");

  return {
    text,
    confidence: text.length > 0 ? 0.9 : 0.15,
    metadata: {
      pageCount: parsed.numpages ?? 1,
      format: "pdf",
      hasExif: false,
      location: null,
    },
  };
}

async function extractImageText(buffer: Buffer): Promise<ValidationExtractionResult> {
  const image = sharp(buffer, { failOn: "none" });
  const metadata = await image.metadata();
  const tesseract = await import("tesseract.js");
  const recognition = await tesseract.recognize(buffer, "eng");
  const text = normalizeText(recognition.data.text ?? "");
  const ocrConfidence = typeof recognition.data.confidence === "number" ? recognition.data.confidence / 100 : 0.5;

  return {
    text,
    confidence: ocrConfidence,
    metadata: {
      pageCount: 1,
      width: metadata.width ?? undefined,
      height: metadata.height ?? undefined,
      format: metadata.format ?? "unknown",
      hasExif: Boolean(metadata.exif),
      location: null,
    },
  };
}

async function extractFallbackText(buffer: Buffer, mimeType: string): Promise<ValidationExtractionResult> {
  const rawText = buffer.toString("utf8").replace(/\0/g, " ");
  const text = normalizeText(rawText.replace(/[^\x09\x0A\x0D\x20-\x7E]/g, " "));

  return {
    text,
    confidence: text.length > 0 ? 0.25 : 0.05,
    metadata: {
      pageCount: 1,
      format: mimeType.split("/")[1] ?? "unknown",
      hasExif: false,
      location: null,
    },
  };
}

export async function extractValidationText(buffer: Buffer, mimeType: string): Promise<ValidationExtractionResult> {
  if (mimeType === "application/pdf") {
    try {
      return await extractPdfText(buffer);
    } catch {
      return extractFallbackText(buffer, mimeType);
    }
  }

  if (mimeType.startsWith("image/")) {
    try {
      return await extractImageText(buffer);
    } catch {
      return extractFallbackText(buffer, mimeType);
    }
  }

  return extractFallbackText(buffer, mimeType);
}
