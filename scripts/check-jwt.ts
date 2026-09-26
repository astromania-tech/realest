#!/usr/bin/env node
import { inspectJwt } from "./jwt-auth.ts";

const candidates = [
  { name: "AGENT_JWT_SECRET", value: process.env.AGENT_JWT_SECRET },
  { name: "ADMIN_JWT_SECRET", value: process.env.ADMIN_JWT_SECRET },
  { name: "OWNER_JWT_SECRET", value: process.env.OWNER_JWT_SECRET },
  { name: "USER_JWT_SECRET", value: process.env.USER_JWT_SECRET },
  { name: "REALEST_AGENT_JWT", value: process.env.REALEST_AGENT_JWT },
  { name: "REALEST_ADMIN_JWT", value: process.env.REALEST_ADMIN_JWT },
  { name: "REALEST_OWNER_JWT", value: process.env.REALEST_OWNER_JWT },
];

function formatExpiry(epoch: number | null | undefined): string {
  if (!epoch) return "none";
  const d = new Date(epoch * 1000);
  return `${d.toISOString()} (in ${Math.round((d.getTime() - Date.now()) / 1000)}s)`;
}

for (const c of candidates) {
  const token = c.value;
  if (!token) {
    console.log(`${c.name}: <not set>`);
    continue;
  }
  const result = inspectJwt(token);
  if (!result || !result.reason) {
    console.log(`${c.name}: Unable to inspect`);
    continue;
  }
  if (result.valid) {
    console.log(`${c.name}: VALID — expires at ${formatExpiry(result.expiresAt)}`);
  } else {
    console.log(
      `${c.name}: INVALID (${result.reason}) — ${
        result.expiresAt ? "expired at " + formatExpiry(result.expiresAt) : ""
      }`,
    );
  }
}

const refreshNames = [
  "SUPABASE_REFRESH_TOKEN",
  "REFRESH_TOKEN",
  "REALEST_REFRESH_TOKEN",
];
const found = refreshNames
  .map((n) => ({ name: n, value: process.env[n] }))
  .filter((x): x is { name: string; value: string } => Boolean(x.value));
if (found.length === 0) {
  console.log("\nNo refresh token found in environment variables.");
} else {
  console.log("\nFound refresh tokens in env:");
  for (const f of found) console.log(`- ${f.name}: length=${f.value.length}`);
}

console.log(
  "\nHint: To test a refresh token, provide it as SUPABASE_REFRESH_TOKEN and I can attempt an exchange against your Supabase project URL.",
);
