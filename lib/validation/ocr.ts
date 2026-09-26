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

/** Cap OCR so image validation jobs cannot hang the process worker forever. */
export const DEFAULT_OCR_TIMEOUT_MS = 10_000;

export function resolveOcrTimeoutMs(
  env: NodeJS.ProcessEnv = process.env,
): number {
  const raw = env.VALIDATION_OCR_TIMEOUT_MS;
  if (raw === undefined || raw.trim() === "") return DEFAULT_OCR_TIMEOUT_MS;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_OCR_TIMEOUT_MS;
  return parsed;
}

export async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label: string,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error(`${label} timed out after ${ms}ms`)),
          ms,
        );
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function normalizeText(value: string): string {
  return value.replace(/\u0000/g, " ").replace(/\s+/g, " ").trim();
}

async function extractPdfText(buffer: Buffer): Promise<ValidationExtractionResult> {
  const pdfParseModule = await import("pdf-parse");
  const pdfParse = (
    pdfParseModule as unknown as {
      default: (input: Buffer) => Promise<{ text: string; numpages?: number }>;
    }
  ).default;
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
  const metadata = await sharp(buffer, { failOn: "none" }).metadata();
  const baseMeta: ValidationExtractionMetadata = {
    pageCount: 1,
    width: metadata.width ?? undefined,
    height: metadata.height ?? undefined,
    format: metadata.format ?? "unknown",
    hasExif: Boolean(metadata.exif),
    location: null,
  };

  // Sharp-only path if OCR is disabled or times out — validation heuristics still use size/mime.
  const timeoutMs = resolveOcrTimeoutMs();
  try {
    const tesseract = await import("tesseract.js");
    const recognition = await withTimeout(
      tesseract.recognize(buffer, "eng"),
      timeoutMs,
      "image OCR",
    );
    const text = normalizeText(recognition.data.text ?? "");
    const ocrConfidence =
      typeof recognition.data.confidence === "number"
        ? recognition.data.confidence / 100
        : 0.5;

    return {
      text,
      confidence: ocrConfidence,
      metadata: baseMeta,
    };
  } catch {
    return {
      text: "",
      confidence: 0.2,
      metadata: baseMeta,
    };
  }
}

async function extractFallbackText(
  buffer: Buffer,
  mimeType: string,
): Promise<ValidationExtractionResult> {
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

export async function extractValidationText(
  buffer: Buffer,
  mimeType: string,
): Promise<ValidationExtractionResult> {
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
