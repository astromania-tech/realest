// app/api/admin/validation/cac-search/route.ts
import { NextRequest, NextResponse } from "next/server";

const CAC_SEARCH_ENDPOINT =
  "https://authapp.cac.gov.ng/name_similarity_app/api/public_search/search";

const CAC_PING_URL = "https://icrp.cac.gov.ng/assets/ping/ping.txt";

// SearchType values confirmed from browser network capture
type SearchType =
  | "RC_NUMBER"
  | "ALL"
  | "BUSINESS_NAME"
  | "COMPANY"
  | "INCORPORATED_TRUSTEE";

const SEARCH_TYPE_MAP: Record<string, SearchType> = {
  rc_number: "RC_NUMBER",
  rc: "RC_NUMBER",
  cac: "RC_NUMBER",
  all: "ALL",
  business_name: "BUSINESS_NAME",
  business: "BUSINESS_NAME",
  company: "COMPANY",
  trustee: "INCORPORATED_TRUSTEE",
  incorporated_trustee: "INCORPORATED_TRUSTEE",
};

function resolveSearchType(raw?: string): SearchType {
  if (!raw) return "RC_NUMBER"; // default to RC lookup
  return SEARCH_TYPE_MAP[raw.toLowerCase()] ?? "RC_NUMBER";
}

function resolveSearchTerm(body: Record<string, string>): string {
  return (
    body.searchTerm ??
    body.search_term ??
    body.rc_number ??
    body.rc ??
    body.cac ??
    body.name ??
    body.search_name ??
    body.business_name ??
    body.query ??
    ""
  ).trim();
}

// Build headers that mirror what the browser sends, including the
// Cloudflare clearance cookie forwarded from the client request.
function buildCacHeaders(clientReq: NextRequest): HeadersInit {
  // Forward the cf_clearance cookie from the original client request if present.
  // Without this, Cloudflare will block subsequent requests from the server.
  const incomingCookie = clientReq.headers.get("cookie") ?? "";
  const cfClearance = incomingCookie
    .split(";")
    .find((c) => c.trim().startsWith("cf_clearance="))
    ?.trim();

  return {
    accept: "*/*",
    "accept-language": "en-GB,en;q=0.9,en-US;q=0.8",
    "cache-control": "no-cache",
    "content-type": "application/json",
    pragma: "no-cache",
    "sec-ch-ua":
      '"Microsoft Edge";v="149", "Chromium";v="149", "Not)A;Brand";v="24"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-site",
    // Referer must be icrp.cac.gov.ng — confirmed from browser capture
    Referer: "https://icrp.cac.gov.ng/",
    Origin: "https://icrp.cac.gov.ng",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0",
    // Forward real IP headers so CAC server sees a realistic client IP
    "x-forwarded-for":
      clientReq.headers.get("x-forwarded-for") ?? "104.28.219.97",
    "x-real-ip":
      clientReq.headers.get("x-real-ip") ??
      clientReq.headers.get("x-forwarded-for") ??
      "104.28.219.97",
    // Attach cf_clearance cookie if we have it
    ...(cfClearance ? { cookie: cfClearance } : {}),
  };
}

async function pingCac(headers: HeadersInit): Promise<void> {
  try {
    await fetch(CAC_PING_URL, {
      method: "GET",
      headers: {
        ...(headers as Record<string, string>),
        Accept: "text/plain, */*",
        Referer: "https://icrp.cac.gov.ng/",
      },
      signal: AbortSignal.timeout(5_000),
    });
  } catch {
    console.warn("[cac-search] ping.txt failed — continuing anyway");
  }
}

export async function POST(req: NextRequest) {
  // 1. Parse body
  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON in request body." },
      { status: 400 }
    );
  }

  const searchTerm = resolveSearchTerm(body);
  if (!searchTerm) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Provide at least one of: searchTerm, rc_number, rc, name, business_name.",
      },
      { status: 400 }
    );
  }

  const searchType = resolveSearchType(body.SearchType ?? body.search_type);
  const cacPayload = { SearchType: searchType, searchTerm };
  const cacHeaders = buildCacHeaders(req);

  // 2. Pre-search ping to keep CAC session alive
  await pingCac(cacHeaders);

  // 3. Forward to CAC
  let cacRes: Response;
  try {
    cacRes = await fetch(CAC_SEARCH_ENDPOINT, {
      method: "POST",
      headers: cacHeaders,
      body: JSON.stringify(cacPayload),
      signal: AbortSignal.timeout(15_000),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown fetch error";
    return NextResponse.json(
      { success: false, error: `Could not reach CAC API: ${message}` },
      { status: 502 }
    );
  }

  // 4. Read raw response
  const raw = await cacRes.text();
  const contentType = cacRes.headers.get("content-type") ?? "";

  // 5. Capture any Set-Cookie headers from CAC (cf_clearance refresh)
  //    and forward them to the client so the browser keeps the session current.
  const setCookie = cacRes.headers.get("set-cookie");

  // 6. Parse JSON
  let data: unknown;
  const looksLikeJson =
    contentType.includes("application/json") ||
    raw.trimStart().startsWith("{") ||
    raw.trimStart().startsWith("[");

  if (looksLikeJson) {
    try {
      data = JSON.parse(raw);
    } catch {
      /* fall through */
    }
  }

  if (data === undefined) {
    return NextResponse.json(
      {
        success: false,
        error: "CAC API returned a non-JSON response.",
        httpStatus: cacRes.status,
        contentType,
        raw: raw.slice(0, 2000),
        sentPayload: cacPayload,
      },
      { status: 502 }
    );
  }

  // 7. Post-search ping (fire and forget)
  pingCac(cacHeaders).catch(() => {});

  const response = NextResponse.json(
    {
      success: cacRes.ok,
      httpStatus: cacRes.status,
      searchType,
      data,
      sentPayload: cacPayload,
    },
    { status: cacRes.ok ? 200 : cacRes.status }
  );

  // Forward refreshed cf_clearance cookie to the browser if CAC sent one
  if (setCookie) {
    response.headers.set("set-cookie", setCookie);
  }

  return response;
}
