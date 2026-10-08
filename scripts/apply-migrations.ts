import fs from "node:fs";
import path from "node:path";
import postgres from "postgres";
import dotenv from "dotenv";

/**
 * Batch applies SQL scripts in numerical order to the Supabase database.
 * Requirements:
 * 1. DATABASE_URL in .env.local (from Supabase Dashboard > Settings > Database)
 * 2. npm install postgres
 */

dotenv.config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ Error: DATABASE_URL is missing in .env.local");
  console.log(
    "Add it: DATABASE_URL=postgres://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:6543/postgres",
  );
  process.exit(1);
}

const sql = postgres(connectionString);

type MigrationFile = { name: string; fullPath: string };

type PgError = {
  message?: string;
  detail?: string;
  hint?: string;
  where?: string;
  query?: string;
};

async function runMigrations(): Promise<void> {
  const migrationDirs: Array<{ path: string; filter: (f: string) => boolean }> =
    [
      {
        path: path.join(process.cwd(), "scripts"),
        filter: (f) => /^\d{3}_/.test(f),
      },
      {
        path: path.join(process.cwd(), "supabase", "migrations"),
        filter: (f) => f.endsWith(".sql"),
      },
    ];

  const allFiles: MigrationFile[] = [];
  for (const dir of migrationDirs) {
    if (!fs.existsSync(dir.path)) continue;

    const files = fs
      .readdirSync(dir.path)
      .filter(dir.filter)
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      .map((f) => ({ name: f, fullPath: path.join(dir.path, f) }));

    allFiles.push(...files);
  }

  console.log(
    `📦 Found ${allFiles.length} scripts. Executing as a single batch transaction...`,
  );

  try {
    await sql.begin(async (tx) => {
      for (const file of allFiles) {
        console.log(`🚀 Applying ${file.name}...`);
        const content = fs.readFileSync(file.fullPath, "utf8");
        try {
          await tx.unsafe(content);
        } catch (err) {
          console.error(`\n❌ Error in file: ${file.fullPath}`);
          throw err;
        }
      }
    });
    console.log("✅ Database schema recreated successfully.");
  } catch (error: unknown) {
    const pgError = error as PgError;
    console.error("❌ Migration failed:", pgError.message ?? String(error));
    if (pgError.detail) console.error("🔍 Detail:", pgError.detail);
    if (pgError.hint) console.error("💡 Hint:", pgError.hint);
    if (pgError.where) console.error("📍 Location:", pgError.where);
    if (pgError.query) {
      console.error("📜 Failing Query segment:");
      console.error(pgError.query.substring(0, 1000));
    }
    process.exit(1);
  } finally {
    await sql.end();
  }
}

void runMigrations();
