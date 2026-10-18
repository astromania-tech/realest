import { TRUST_CONTRACT_VERSION, type TrustReadEnvelope } from "@/lib/trust/types";

export class TrustReaderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TrustReaderError";
  }
}

export function resolveTrustReaderUrl(env: NodeJS.ProcessEnv = process.env): string | null {
  const value = env.TRUST_READER_URL?.trim();
  if (!value) return null;
  return value.replace(/\/$/, "");
}

export async function readTrustFile(input: {
  kind: "document" | "image";
  mimeType: string;
  bytes: Buffer;
  claimedDocumentType?: string;
  env?: NodeJS.ProcessEnv;
  fetchImpl?: typeof fetch;
}): Promise<TrustReadEnvelope> {
  const env = input.env ?? process.env;
  const baseUrl = resolveTrustReaderUrl(env);
  if (!baseUrl) throw new TrustReaderError("TRUST_READER_URL is not set");
  const fetchImpl = input.fetchImpl ?? fetch;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = env.TRUST_READER_TOKEN?.trim();
  if (token) headers.Authorization = `Bearer ${token}`;
  let response: Response;
  try {
    response = await fetchImpl(`${baseUrl}/v1/read`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        kind: input.kind,
        mimeType: input.mimeType,
        contentBase64: input.bytes.toString("base64"),
        claimedDocumentType: input.claimedDocumentType ?? "",
      }),
    });
  } catch (error) {
    throw new TrustReaderError(error instanceof Error ? error.message : "Trust reader request failed");
  }
  if (!response.ok) throw new TrustReaderError(`Trust reader returned ${response.status}`);
  const body = (await response.json()) as TrustReadEnvelope;
  if (body.reader !== "realest-trust-reader" || body.contractVersion !== TRUST_CONTRACT_VERSION) {
    throw new TrustReaderError("Trust reader returned an unknown contract");
  }
  return body;
}
