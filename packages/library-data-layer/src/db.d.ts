import * as schema from "./schema";
/**
 * Initialize Drizzle ORM with Cloudflare D1 database
 * @param d1 - Cloudflare D1 database instance from environment bindings
 * @returns Drizzle database instance with schema
 */
export declare function initDB(d1: D1Database): import("drizzle-orm/d1").DrizzleD1Database<typeof schema> & {
    $client: D1Database;
};
export type DB = ReturnType<typeof initDB>;
/**
 * Validates if the database is correctly initialized with the required schema and migrations.
 * @param db - Drizzle database instance
 * @returns Object containing validation result and potential error message
 */
export declare function validateDB(db: DB): Promise<{
    success: boolean;
    error?: string;
}>;
