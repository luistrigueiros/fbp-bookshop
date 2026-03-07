import { beforeAll, describe, expect, it, afterAll } from "bun:test";
import { readFileSync } from "fs";
import { join } from "path";
import app from "@/index";
import { createD1TestEnv, disposeD1TestEnv, type TestEnv } from "library-test-utils";

describe("Upload Service Integration Test", () => {
  let testEnv: TestEnv;

  beforeAll(async () => {
    testEnv = await createD1TestEnv({
      bindings: {
        ENVIRONMENT: "development",
      },
      // drizzleDirPath defaults to process.cwd()/drizzle, which is where migrations are in this package
    });
  }, 60000);

  afterAll(async () => {
    await disposeD1TestEnv(testEnv);
  });

  it("should process the Excel file and store data in D1", async () => {
    const env = { DB: testEnv.env.DB, ENVIRONMENT: "development" };
    
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
  }, 60000);

  it("should serve the landing page at root", async () => {
    const env = { DB: testEnv.env.DB, ENVIRONMENT: "development" };
    const res = await app.fetch(new Request("http://localhost/"), env);
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain("<!DOCTYPE html>");
    expect(text).toContain("Upload Excel File");
    expect(text).toContain('form id="uploadForm"');
  });
});
