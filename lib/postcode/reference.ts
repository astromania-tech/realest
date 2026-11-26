import { NIPOST_API_BASE } from "@/lib/postcode/nipost";

export type NipostPlace = { code: string; name: string | null };

const STATE_ALIASES: Record<string, string> = {
  FCT: "FC",
  "FEDERAL CAPITAL TERRITORY": "FC",
};

export const NIPOST_STATES_CACHE_MS = 60 * 60 * 1000;

type StatesCache = { value: { at: number; states: NipostPlace[] } | null };

const moduleStatesCache: StatesCache = { value: null };

type ReferenceDeps = {
  fetchImpl?: typeof fetch;
  apiKey?: string;
  baseUrl?: string;
  cache?: StatesCache;
  now?: number;
};

export function nipostPlaceValue(place: NipostPlace): string {
  return place.name ?? place.code;
}

export function findNipostPlace(places: NipostPlace[], value: string): NipostPlace | undefined {
  return places.find((place) => nipostPlaceValue(place) === value);
}

function places(value: unknown): NipostPlace[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const row = item as { code?: unknown; name?: unknown };
    if (typeof row.code !== "string" || !row.code.trim()) return [];
    return [{
      code: row.code.trim(),
      name: typeof row.name === "string" && row.name.trim() ? row.name.trim() : null,
    }];
  });
}

export function matchNipostState(input: string, states: NipostPlace[]): NipostPlace | null {
  const upper = input.trim().toUpperCase();
  if (!upper) return null;
  const alias = STATE_ALIASES[upper];
  if (alias) return states.find((state) => state.code.toUpperCase() === alias) ?? null;
  return (
    states.find((state) => state.name?.toUpperCase() === upper || state.code.toUpperCase() === upper) ??
    null
  );
}

async function nipostGet(path: string, deps: ReferenceDeps): Promise<{ ok: true; body: unknown } | { ok: false; status: number; message: string }> {
  const apiKey = (deps.apiKey ?? process.env.NIPOST_API_KEY ?? "").trim();
  if (!apiKey) return { ok: false, status: 503, message: "NIPOST postcode lookup is not configured" };
  const baseUrl = (deps.baseUrl ?? process.env.NIPOST_API_BASE_URL ?? NIPOST_API_BASE).replace(/\/$/, "");
  try {
    const response = await (deps.fetchImpl ?? fetch)(`${baseUrl}${path}`, {
      headers: { Accept: "application/json", "X-API-Key": apiKey },
    });
    if (!response.ok) return { ok: false, status: 502, message: "NIPOST lookup failed" };
    return { ok: true, body: await response.json() };
  } catch {
    return { ok: false, status: 502, message: "NIPOST lookup failed" };
  }
}

export async function listNipostStates(deps: ReferenceDeps = {}): Promise<
  { ok: true; states: NipostPlace[] } | { ok: false; status: number; message: string }
> {
  const cache = deps.cache ?? (deps.fetchImpl || deps.apiKey || deps.baseUrl ? undefined : moduleStatesCache);
  const now = deps.now ?? Date.now();
  if (cache?.value && now - cache.value.at < NIPOST_STATES_CACHE_MS) {
    return { ok: true, states: cache.value.states };
  }
  const result = await nipostGet("/v1/reference/states", deps);
  if (!result.ok) return result;
  const states = places((result.body as { data?: { states?: unknown } })?.data?.states);
  if (states.length === 0) return { ok: false, status: 502, message: "NIPOST lookup failed" };
  if (cache) cache.value = { at: now, states };
  return { ok: true, states };
}

export async function listNipostLgas(stateCode: string, deps: ReferenceDeps = {}): Promise<
  { ok: true; lgas: NipostPlace[] } | { ok: false; status: number; message: string }
> {
  const result = await nipostGet(`/v1/reference/lgas?state=${encodeURIComponent(stateCode)}`, deps);
  if (!result.ok) return result;
  return { ok: true, lgas: places((result.body as { data?: { lgas?: unknown } })?.data?.lgas) };
}

export function nipostAreaLabel(state: NipostPlace, lga: NipostPlace): string {
  return `${state.name ?? state.code} · ${lga.name ?? lga.code} · ${state.code}-${lga.code}`;
}
