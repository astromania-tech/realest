import { createHash } from "node:crypto";
import type { KycIdType } from "@/lib/kyc/types";

export type DetailMatch = "match" | "mismatch" | "incomplete";

export type PersonClaim = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
};

export type RegistryRecord = {
  firstName: string | null;
  lastName: string | null;
  dateOfBirth: string | null;
  companyName: string | null;
};

const PERSON_NAME = /^[\p{L}][\p{L}' -]{1,79}$/u;
const COMPANY_NAME = /^[\p{L}0-9]+(?: [\p{L}0-9]+)*$/u;

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function readString(record: Record<string, unknown> | null, key: string): string | null {
  const value = record?.[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function normalizePersonName(raw: string): string | null {
  const value = raw.normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase();
  if (!PERSON_NAME.test(value)) return null;
  return value;
}

export function normalizeDateOfBirth(raw: string): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1900) return null;
  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    return null;
  }
  const today = new Date();
  const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  if (parsed.getTime() > todayUtc) return null;
  return `${match[1]}-${match[2]}-${match[3]}`;
}

export function normalizeCompanyName(raw: string): string | null {
  let value = raw.normalize("NFKC").trim().toLowerCase().replace(/&/g, " and ");
  value = value.replace(/[.,']/g, " ").replace(/\s+/g, " ").trim();
  value = value.replace(/\b(limited|ltd)\b$/u, "ltd");
  value = value.replace(/\b(incorporated|inc)\b$/u, "inc");
  value = value.replace(/\b(unlimited|ultd)\b$/u, "ultd");
  value = value.replace(/\bplc\b$/u, "plc");
  value = value.replace(/\s+/g, " ").trim();
  if (value.length < 2 || value.length > 160 || !COMPANY_NAME.test(value)) return null;
  return value;
}

function digest(canonical: string): string {
  return createHash("sha256").update(canonical).digest("hex");
}

export function personClaimDigest(claim: PersonClaim): string | null {
  const firstName = normalizePersonName(claim.firstName);
  const lastName = normalizePersonName(claim.lastName);
  const dateOfBirth = normalizeDateOfBirth(claim.dateOfBirth);
  if (!firstName || !lastName || !dateOfBirth) return null;
  return digest(`person\n${firstName}\n${lastName}\n${dateOfBirth}`);
}

export function companyClaimDigest(companyName: string): string | null {
  const name = normalizeCompanyName(companyName);
  if (!name) return null;
  return digest(`company\n${name}`);
}

export function extractRegistryRecord(body: unknown): RegistryRecord {
  const root = asRecord(body);
  const data = asRecord(root?.data) ?? root;
  return {
    firstName: readString(data, "firstName"),
    lastName: readString(data, "lastName"),
    dateOfBirth: readString(data, "dateOfBirth"),
    companyName: readString(data, "name"),
  };
}

export function matchClaimToRegistry(
  idType: KycIdType,
  claim: { person: PersonClaim | null; companyName: string | null },
  registry: RegistryRecord,
): DetailMatch {
  if (idType === "cac") {
    const claimed = claim.companyName ? companyClaimDigest(claim.companyName) : null;
    const found = registry.companyName ? companyClaimDigest(registry.companyName) : null;
    if (!claimed || !found) return "incomplete";
    return claimed === found ? "match" : "mismatch";
  }
  const claimed = claim.person ? personClaimDigest(claim.person) : null;
  const found = registry.firstName && registry.lastName && registry.dateOfBirth
    ? personClaimDigest({
        firstName: registry.firstName,
        lastName: registry.lastName,
        dateOfBirth: registry.dateOfBirth,
      })
    : null;
  if (!claimed || !found) return "incomplete";
  return claimed === found ? "match" : "mismatch";
}
