import { beforeAll, describe, expect, it, afterAll } from "bun:test";
import { readFileSync } from "fs";
import { join } from "path";
import worker from "@/index"; // Import the worker object which includes fetch and queue
import { createD1TestEnv, disposeD1TestEnv, type TestEnv } from "library-test-utils";
import { createRepositories } from "library-data-layer";

describe("Upload Service Integration Test (Async)", () => {
  let testEnv: TestEnv;

  beforeAll(async () => {
    testEnv = await createD1TestEnv({
      bindings: {
        ENVIRONMENT: "development",
      },
      r2Buckets: {
        UPLOADS_BUCKET: "library-uploads",
      },
      queueProducers: {
        UPLOAD_QUEUE: "library-upload-queue",
      },
      // In a real Miniflare setup, we might need queueConsumers too,
      // but for this test we'll manually call the queue handler.
    });
  }, 60000);

  afterAll(async () => {
    await disposeD1TestEnv(testEnv);
  });

  it("should accept the Excel file and eventually store data in D1", async () => {
    const env = { 
      DB: testEnv.env.DB, 
      UPLOADS_BUCKET: testEnv.env.UPLOADS_BUCKET,
      UPLOAD_QUEUE: testEnv.env.UPLOAD_QUEUE,
      ENVIRONMENT: "development" 
    };
    
    const filePath = join(process.cwd(), "test", "FBP-DB.xlsx");
    const fileContent = readFileSync(filePath);

    // 1. Submit the upload request
    const formData = new FormData();
    const blob = new Blob([fileContent], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    formData.append("file", blob, "FBP-DB.xlsx");

    const req = new Request("http://localhost/upload", {
      method: "POST",
      body: formData,
    });

    const res = await worker.fetch(req, env);

    const json = (await res.json()) as { message: string; key: string };
    expect(res.status).toBe(202);
    expect(json.message).toBe("File upload accepted and queued for processing");
    expect(json.key).toBeDefined();

    // 2. Manually trigger the queue handler to simulate background processing
    // In a full integration test with Miniflare running, this might happen automatically,
    // but calling it directly ensures we can wait for it to finish.
    const batch = {
      messages: [
        {
          id: "test-msg-1",
          timestamp: new Date(),
          body: { key: json.key, filename: "FBP-DB.xlsx" },
          ack: () => {},
          retry: () => {},
        }
      ],
      queue: "library-upload-queue",
    };

    // We need to cast because our mock batch is minimal
    await worker.queue(batch as any, env as any);

    // 3. Verify data in the database using repositories
    const repos = createRepositories(testEnv.db);
    
    const booksCount = await repos.books.count();
    expect(booksCount).toBeGreaterThan(0);

    const gendersCount = await repos.genders.count();
    expect(gendersCount).toBeGreaterThan(0);

    const publishersCount = await repos.publishers.count();
    expect(publishersCount).toBeGreaterThan(0);
  }, 60000);

  it("should serve the landing page at root", async () => {
    const env = { 
        DB: testEnv.env.DB, 
        ENVIRONMENT: "development" 
    };
    const res = await worker.fetch(new Request("http://localhost/"), env as any);
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain("<!DOCTYPE html>");
    expect(text).toContain("Upload Excel File");
    expect(text).toContain('form id="uploadForm"');
  });
});
