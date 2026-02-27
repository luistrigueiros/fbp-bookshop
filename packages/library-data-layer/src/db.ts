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
    await db.run(sql`SELECT count(*) FROM ${schema.gender}`);
    await db.run(sql`SELECT count(*) FROM ${schema.publisher}`);

    // 2. Check if drizzle migrations table exists and has at least one entry
    // D1 uses __drizzle_migrations by default
    const migrationsTable = await db.run(
      sql`SELECT name FROM sqlite_master WHERE type='table' AND name='__drizzle_migrations'`,
    );
    if (migrationsTable.results.length === 0) {
      return {
        success: false,
        error: "Migrations table '__drizzle_migrations' not found.",
      };
    }

    const migrationCount = await db.run(
      sql`SELECT count(*) as count FROM __drizzle_migrations`,
    );
    const countResult = migrationCount.results[0] as { count: number };
    if (Number(countResult.count) === 0) {
      return { success: false, error: "No migrations have been applied." };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
