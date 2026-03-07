import { beforeAll, describe, expect, it } from "bun:test";
import { Miniflare } from "miniflare";
import { readFileSync } from "fs";
import { join } from "path";
import app from "@/index";

describe("Upload Service Integration Test", () => {
  let mf: Miniflare;

  beforeAll(async () => {
    mf = new Miniflare({
      modules: true,
      script: "export default { fetch: () => new Response('stub') }", // Minimal script
      d1Databases: ["DB"],
      compatibilityDate: "2026-02-19",
      compatibilityFlags: ["nodejs_compat"],
      bindings: {
        ENVIRONMENT: "development",
      },
    });
  });

  it("should process the Excel file and store data in D1", async () => {
    const d1 = (await mf.getD1Database("DB")) as any;
    const env = { DB: d1, ENVIRONMENT: "development" };
    
    const filePath = join(process.cwd(), "test", "FBP-DB.xlsx");
    const fileContent = readFileSync(filePath);

    // Create a multipart/form-data request
    const formData = new FormData();
    const blob = new Blob([fileContent], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    formData.append("file", blob, "FBP-DB.xlsx");

    const req = new Request("http://localhost/upload", {
      method: "POST",
      body: formData,
    });

    const res = await app.fetch(req, env);

    const json = (await res.json()) as { message: string; booksCount: number };
    expect(res.status).toBe(200);
    expect(json.message).toBe("File processed and data stored successfully");
    expect(json.booksCount).toBeGreaterThan(0);

    // Verify data in the database
    const books = await d1.prepare("SELECT * FROM book").all();
    expect(books.results.length).toBe(json.booksCount);

    const genders = await d1.prepare("SELECT * FROM gender").all();
    expect(genders.results.length).toBeGreaterThan(0);

    const publishers = await d1.prepare("SELECT * FROM publisher").all();
    expect(publishers.results.length).toBeGreaterThan(0);
  });

  it("should serve the landing page at root", async () => {
    const d1 = (await mf.getD1Database("DB")) as any;
    const env = { DB: d1, ENVIRONMENT: "development" };
    const res = await app.fetch(new Request("http://localhost/"), env);
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain("<!DOCTYPE html>");
    expect(text).toContain("Upload Excel File");
    expect(text).toContain('form id="uploadForm"');
  });
});
