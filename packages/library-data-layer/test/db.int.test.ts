import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import {
  createD1TestEnv,
  disposeD1TestEnv,
  type TestEnv,
} from "library-test-utils";
import { validateDB } from "@/index";

describe("Database Initialization and Validation", () => {
  let testEnv: Awaited<ReturnType<typeof createD1TestEnv>>;

  beforeAll(async () => {
    testEnv = await createD1TestEnv();
  });

  afterAll(async () => {
    await disposeD1TestEnv(testEnv);
  });

  it("should pass validation after migrations are applied", async () => {
    const result = await validateDB(testEnv.db);
    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("should fail validation if a core table is missing", async () => {
    // Drop a table to simulate a missing schema
    await testEnv.mf.getBindings().then((bindings: any) => {
      return bindings.DB.exec("DROP TABLE book;");
    });

    const result = await validateDB(testEnv.db);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    // Drizzle/D1 might return "no such table" or a "Failed query" wrapper
    expect(result.error?.toLowerCase()).toMatch(/no such table|failed query/);
  });

  it("should fail validation if migrations table is empty", async () => {
    // Create all core tables but empty migrations table
    await testEnv.mf.getBindings().then(async (bindings: any) => {
      await bindings.DB.exec("DROP TABLE IF EXISTS book_genre;");
      await bindings.DB.exec("DROP TABLE IF EXISTS book;");
      await bindings.DB.exec("DROP TABLE IF EXISTS genre;");
      await bindings.DB.exec("DROP TABLE IF EXISTS publisher;");
      await bindings.DB.exec("DROP TABLE IF EXISTS __drizzle_migrations;");

      await bindings.DB.exec("CREATE TABLE book (id INTEGER PRIMARY KEY);");
      await bindings.DB.exec("CREATE TABLE genre (id INTEGER PRIMARY KEY);");
      await bindings.DB.exec(
        "CREATE TABLE publisher (id INTEGER PRIMARY KEY);",
      );
      await bindings.DB.exec(
        "CREATE TABLE __drizzle_migrations (id INTEGER PRIMARY KEY);",
      );
    });

    const result = await validateDB(testEnv.db);
    expect(result.success).toBe(false);
    expect(result.error).toBe("No migrations have been applied.");
  });

  it("should warn but succeed if migrations table is missing but book table exists", async () => {
    // Create all core tables but NO migrations table
    await testEnv.mf.getBindings().then(async (bindings: any) => {
      await bindings.DB.exec("DROP TABLE IF EXISTS book_genre;");
      await bindings.DB.exec("DROP TABLE IF EXISTS book;");
      await bindings.DB.exec("DROP TABLE IF EXISTS genre;");
      await bindings.DB.exec("DROP TABLE IF EXISTS publisher;");
      await bindings.DB.exec("DROP TABLE IF EXISTS __drizzle_migrations;");

      await bindings.DB.exec("CREATE TABLE book (id INTEGER PRIMARY KEY);");
      await bindings.DB.exec("CREATE TABLE genre (id INTEGER PRIMARY KEY);");
      await bindings.DB.exec(
        "CREATE TABLE publisher (id INTEGER PRIMARY KEY);",
      );
    });

    const result = await validateDB(testEnv.db);
    expect(result.success).toBe(true);
  });
});
