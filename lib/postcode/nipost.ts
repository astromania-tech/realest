import { parseNipostPostcode } from "@/lib/postcode/format";

export const NIPOST_API_BASE = "https://api.postcode.gov.ng";

export type NipostLookup = {
  postcode: string;
  valid: boolean;
  stateName: string | null;
  lgaName: string | null;
  localityName: string | null;
  zone: string | null;
  recentHouseAddress: string | null;
  buildingUseStatus: string | null;
};

export type NipostLookupResult =
  | { ok: true; lookup: NipostLookup }
  | { ok: false; status: number; message: string };

type LookupDeps = {
  fetchImpl?: typeof fetch;
  apiKey?: string;
  baseUrl?: string;
};

function textField(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function mapStatus(status: number): { status: number; message: string } {
  if (status === 401) return { status: 503, message: "NIPOST rejected the API key" };
  if (status === 402) return { status: 402, message: "NIPOST credits are used up" };
  if (status === 403) return { status: 403, message: "This NIPOST key cannot look up postcodes" };
  if (status === 429) return { status: 429, message: "NIPOST rate limit reached. Try again shortly" };
  return { status: 502, message: "NIPOST lookup failed" };
}

export async function lookupNipostPostcode(
  input: string,
  deps: LookupDeps = {},
): Promise<NipostLookupResult> {
  const parsed = parseNipostPostcode(input);
  if (!parsed) {
    return {
      ok: false,
      status: 400,
      message: "Enter a NIPOST postcode, for example LA-11-W06-TC-10",
    };
  }

  const apiKey = (deps.apiKey ?? process.env.NIPOST_API_KEY ?? "").trim();
  if (!apiKey) {
    return { ok: false, status: 503, message: "NIPOST postcode lookup is not configured" };
  }

  const baseUrl = (deps.baseUrl ?? process.env.NIPOST_API_BASE_URL ?? NIPOST_API_BASE).replace(/\/$/, "");
  const fetchImpl = deps.fetchImpl ?? fetch;
  let response: Response;
  try {
    response = await fetchImpl(
      `${baseUrl}/v1/lookup?code=${encodeURIComponent(parsed.canonical)}`,
      { headers: { Accept: "application/json", "X-API-Key": apiKey } },
    );
  } catch {
    return { ok: false, status: 502, message: "NIPOST lookup failed" };
  }

  if (!response.ok) return { ok: false, ...mapStatus(response.status) };

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    return { ok: false, status: 502, message: "NIPOST lookup failed" };
  }

  const data = (body as { data?: Record<string, unknown> } | null)?.data;
  if (!data || typeof data.postcode !== "string" || typeof data.valid !== "boolean") {
    return { ok: false, status: 502, message: "NIPOST lookup failed" };
  }

  const admin = data.administrative_address as Record<string, unknown> | undefined;
  const recent = data.recent_house_address as Record<string, unknown> | undefined;
  const canonical = parseNipostPostcode(data.postcode)?.canonical ?? parsed.canonical;

  return {
    ok: true,
    lookup: {
      postcode: canonical,
      valid: data.valid,
      stateName: textField(admin?.state_name),
      lgaName: textField(admin?.lga_name),
      localityName: textField(admin?.locality_name),
      zone: textField(admin?.zone),
      recentHouseAddress: textField(recent?.recent),
      buildingUseStatus: textField(data.building_use_status),
    },
  };
}
