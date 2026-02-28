import { beforeAll, describe, expect, it } from "bun:test";
import { Miniflare } from "miniflare";
import { readFileSync } from "fs";
import { join } from "path";
import { collectSqlFiles, runDatabaseMigrations } from "./test-utils";

describe("Upload Service Integration Test", () => {
  let mf: Miniflare;

  beforeAll(async () => {
    mf = new Miniflare({
      modules: true,
      scriptPath: "dist/index.js",
      d1Databases: ["DB"],
      compatibilityDate: "2026-02-19",
    });

    // Initialize the database by applying Drizzle SQL migrations if available
    const db = await mf.getD1Database("DB");

    const drizzleDir = join(process.cwd(), "drizzle");
    const migrationFiles = collectSqlFiles(drizzleDir);

    expect(migrationFiles.length).toBeGreaterThan(0);
    await runDatabaseMigrations(migrationFiles, db);
  });

  it("should process the Excel file and store data in D1", async () => {
    const filePath = join(process.cwd(), "test", "FBP-DB.xlsx");
    const fileContent = readFileSync(filePath);

    // Create a multipart/form-data request
    const formData = new FormData();
    const blob = new Blob([fileContent], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    formData.append("file", blob, "FBP-DB.xlsx");

    const res = await mf.dispatchFetch("http://localhost/upload", {
      method: "POST",
      body: formData as any, // Restore cast temporarily but keep other fixes
    });

    const json = (await res.json()) as { message: string; booksCount: number };
    expect(res.status).toBe(200);
    expect(json.message).toBe("File processed and data stored successfully");
    expect(json.booksCount).toBeGreaterThan(0);

    // Verify data in the database
    const db = await mf.getD1Database("DB");
    const books = await db.prepare("SELECT * FROM book").all();
    expect(books.results.length).toBe(json.booksCount);

    const genders = await db.prepare("SELECT * FROM gender").all();
    expect(genders.results.length).toBeGreaterThan(0);

    const publishers = await db.prepare("SELECT * FROM publisher").all();
    expect(publishers.results.length).toBeGreaterThan(0);
  });

  it("should serve the landing page at root", async () => {
    const res = await mf.dispatchFetch("http://localhost/");
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain("<!DOCTYPE html>");
    expect(text).toContain("Upload Excel File");
    expect(text).toContain('form id="uploadForm"');
  });
});
