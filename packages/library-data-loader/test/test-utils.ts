import {existsSync, readdirSync, readFileSync, statSync} from "fs";
import {resolve} from "path";

/**
 * Helper to recursively collect .sql files from a directory
 */
export const collectSqlFiles = (dir: string): string[] => {
  if (!existsSync(dir)) return [];
  const entries = readdirSync(dir);
  const files: string[] = [];
  for (const entry of entries) {
    const full = resolve(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      files.push(...collectSqlFiles(full));
    } else if (entry.toLowerCase().endsWith(".sql")) {
      files.push(full);
    }
  }
  // Ensure deterministic application order (e.g., 0000_*, 0001_* ...)
  files.sort();
  return files;
};

export async function runDatabaseMigrations(migrationFiles: string[], db: D1Database) {
    for (const file of migrationFiles) {
        const content = readFileSync(file, "utf8");
        // Split by Drizzle statement breakpoint
        const statements = content.split("--> statement-breakpoint");
        for (const statement of statements) {
            if (statement.trim().length > 0) {
                await db.prepare(statement).run();
            }
        }
    }
}