/**
 * Load CLI env from the repo root.
 * Prefers .env.local (Next.js local convention), then fills gaps from .env.
 */
import { existsSync } from "node:fs";
import { join } from "node:path";
import dotenv from "dotenv";

export function loadCliEnv(cwd: string = process.cwd()): {
  loaded: string[];
} {
  const loaded: string[] = [];
  const envPath = join(cwd, ".env");
  const localPath = join(cwd, ".env.local");

  if (existsSync(envPath)) {
    dotenv.config({ path: envPath });
    loaded.push(".env");
  }
  if (existsSync(localPath)) {
    // Local wins over .env for the same key.
    dotenv.config({ path: localPath, override: true });
    loaded.push(".env.local");
  }

  return { loaded };
}
