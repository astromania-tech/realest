/**
 * Ensure local Supabase storage buckets exist (avatars, property-media, property-documents).
 *
 *   npx tsx scripts/ensure-local-storage-buckets.ts
 */
import { loadCliEnv } from "./lib/load-cli-env.ts";

loadCliEnv();

const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

type Bucket = { id: string; name: string; public: boolean };

const REQUIRED: Bucket[] = [
  { id: "avatars", name: "avatars", public: true },
  { id: "property-media", name: "property-media", public: false },
  { id: "property-documents", name: "property-documents", public: false },
];

async function listBuckets(): Promise<Array<{ id: string; name: string }>> {
  const res = await fetch(`${url}/storage/v1/bucket`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`list buckets failed: ${res.status} ${text}`);
  }
  return JSON.parse(text) as Array<{ id: string; name: string }>;
}

async function main(): Promise<void> {
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  if (!/127\.0\.0\.1|localhost/.test(url)) {
    throw new Error(`Refusing non-local Supabase URL: ${url}`);
  }

  const existing = await listBuckets();
  console.log(
    `existing buckets: ${existing.map((b) => b.id).join(", ") || "(none)"}`,
  );

  for (const bucket of REQUIRED) {
    if (existing.some((e) => e.id === bucket.id || e.name === bucket.name)) {
      console.log(`ok  ${bucket.id} (already present)`);
      continue;
    }

    const res = await fetch(`${url}/storage/v1/bucket`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: bucket.id,
        name: bucket.name,
        public: bucket.public,
        file_size_limit: 52428800,
      }),
    });
    const text = await res.text();
    if (!res.ok && !/already exists|duplicate/i.test(text)) {
      throw new Error(`create ${bucket.id} failed: ${res.status} ${text}`);
    }
    console.log(`created ${bucket.id}`);
  }

  const after = await listBuckets();
  const ids = new Set(after.map((b) => b.id));
  const missing = REQUIRED.filter((b) => !ids.has(b.id)).map((b) => b.id);
  if (missing.length > 0) {
    throw new Error(`still missing buckets: ${missing.join(", ")}`);
  }
  console.log("all required storage buckets ready");
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`ensure-local-storage-buckets failed: ${message}`);
  process.exit(1);
});
