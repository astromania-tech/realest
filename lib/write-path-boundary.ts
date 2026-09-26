import fs from "node:fs";
import path from "node:path";

/** Matches supabase/service client table access: .from('table') or .from("table") */
const TABLE_FROM_RE =
  /\.(?:from)\(\s*['"]([a-z_][a-z0-9_]*)['"]\s*\)/gi;

/** Storage bucket access is allowed; strip those before flagging. */
const STORAGE_FROM_RE = /\.storage\s*\.from\(\s*['"][^'"]+['"]\s*\)/gi;

export type WritePathViolation = {
  file: string;
  table: string;
  line: number;
  snippet: string;
};

function walkApiRoutes(dir: string, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkApiRoutes(full, out);
    else if (entry.name === "route.ts" || entry.name === "route.js") out.push(full);
  }
  return out;
}

/**
 * A-01 scanner: find Supabase JS table .from('...') usage under app/api.
 * Auth/storage-only clients are fine; table access must be Prisma.
 * @see lib/a01-write-path-boundary.test.ts
 */
export function findSupabaseTableFromViolations(
  apiRoot = path.join(process.cwd(), "app", "api"),
): WritePathViolation[] {
  const files = walkApiRoutes(apiRoot);
  const violations: WritePathViolation[] = [];

  for (const file of files) {
    const raw = fs.readFileSync(file, "utf8");
    const scrubbed = raw.replace(STORAGE_FROM_RE, ".storage.from(/*bucket*/)");
    const lines = scrubbed.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      TABLE_FROM_RE.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = TABLE_FROM_RE.exec(line)) !== null) {
        const table = match[1];
        // Ignore obvious non-table placeholders if any appear in comments-only lines
        if (line.trimStart().startsWith("//") || line.trimStart().startsWith("*")) continue;
        violations.push({
          file: path.relative(process.cwd(), file),
          table,
          line: i + 1,
          snippet: line.trim().slice(0, 120),
        });
      }
    }
  }

  return violations;
}
