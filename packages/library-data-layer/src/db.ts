import { drizzle } from "drizzle-orm/d1";
import { sql } from "drizzle-orm";
import * as schema from "./schema";

/**
 * Initialize Drizzle ORM with Cloudflare D1 database
 * @param d1 - Cloudflare D1 database instance from environment bindings
 * @returns Drizzle database instance with schema
 */
export function initDB(d1: D1Database) {
  return drizzle(d1, { schema });
}

export type DB = ReturnType<typeof initDB>;

/**
 * Validates if the database is correctly initialized with the required schema and migrations.
 * @param db - Drizzle database instance
 * @returns Object containing validation result and potential error message
 */
export async function validateDB(
  db: DB,
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Check if the core tables exist by running a simple count query
    // This confirms the schema is present and accessible.
    await db.run(sql`SELECT count(*) FROM ${schema.book}`);
    await db.run(sql`SELECT count(*) FROM ${schema.genre}`);
    await db.run(sql`SELECT count(*) FROM ${schema.publisher}`);
    await db.run(sql`SELECT count(*) FROM ${schema.uploadStatus}`);

    // 2. Check if drizzle migrations table exists (fallback to checking for 'book' if missing)
    const migrationsTable = await db.run(
      sql`SELECT name FROM sqlite_master WHERE type='table' AND name='__drizzle_migrations'`,
    );

    if (migrationsTable.results.length === 0) {
      // If we have books, we probably have a schema but missing migrations table (common with raw SQL)
      const bookTable = await db.run(
        sql`SELECT name FROM sqlite_master WHERE type='table' AND name='book'`,
      );
      if (bookTable.results.length === 0) {
        return {
          success: false,
          error: "Migrations table '__drizzle_migrations' not found.",
        };
      }
      console.log(
        "[VALIDATION] Migrations table missing but 'book' table found. Proceeding...",
      );
    } else {
      const migrationCount = await db.run(
        sql`SELECT count(*) as count FROM __drizzle_migrations`,
      );
      const countResult = migrationCount.results[0] as { count: number };
      if (Number(countResult.count) === 0) {
        return { success: false, error: "No migrations have been applied." };
      }
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Runs SQL migrations against the D1 database.
 * @param db - D1 database instance
 * @param sqlStatements - Array of SQL statements to execute
 */
export async function runMigrations(
  db: D1Database,
  sqlStatements: string[],
): Promise<void> {
  for (const statement of sqlStatements) {
    if (statement.trim().length > 0) {
      try {
        await db.prepare(statement).run();
      } catch (err) {
        // Ignore "table already exists" errors during auto-migration in dev
        const message = err instanceof Error ? err.message : String(err);
        if (message.includes("already exists")) {
          console.log(
            `[DEV] Skipping statement (already exists): ${statement.substring(0, 50)}...`,
          );
          continue;
        }
        throw err;
      }
    }
  }
}

/**
 * Splits a Drizzle migration file content into individual statements.
 * @param content - SQL migration file content
 * @returns Array of SQL statements
 */
export function splitMigrationStatements(content: string): string[] {
  return content
    .split("--> statement-breakpoint")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}
