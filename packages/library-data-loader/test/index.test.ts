import { beforeAll, describe, expect, it, afterAll } from "bun:test";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import worker from "@/index"; // Import the worker object which includes fetch and queue
import { createD1TestEnv, disposeD1TestEnv, type TestEnv } from "library-test-utils";
import { createRepositories, UploadStatus } from "library-data-layer";

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
      drizzleDirPath: join(process.cwd(), "..", "library-data-layer", "drizzle"),
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
    
    const filePath = join(process.cwd(), "packages", "library-data-loader", "test", "FBP-DB.xlsx");
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
    
    const key = json.key;

    // 2. Manually trigger the queue handler to simulate background processing
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

    await worker.queue(batch as any, env as any);

    // Verify final status
    const finalStatusRes = await worker.fetch(new Request(`http://localhost/upload-status/${key}`), env);
    const finalStatusJson = await finalStatusRes.json() as any;
    
    if (finalStatusJson.status !== UploadStatus.PROCESSED_SUCCESSFULLY) {
        writeFileSync(join(process.cwd(), "test_error.json"), JSON.stringify(finalStatusJson, null, 2));
    }
    
    expect(finalStatusJson.status).toBe(UploadStatus.PROCESSED_SUCCESSFULLY);

    // 3. Repeat the process to verify upsert (no duplicates)
    const repos = createRepositories(env.DB);
    const initialBookCount = await repos.books.count();
    
    // Simulate second upload of the same file
    const secondKey = `uploads/${Date.now()}-second-FBP-DB.xlsx`;
    await worker.queue({
      messages: [{
        id: "test-msg-2",
        timestamp: new Date(),
        body: { key: secondKey, filename: "FBP-DB.xlsx" },
        ack: () => {},
        retry: () => {},
      }],
      queue: "library-upload-queue",
    } as any, env as any);

    // Since we didn't actually put it in R2 for the second key, we should reuse the first key or actually put it.
    // Let's just re-run the queue with the SAME key to simulate processing the same data.
    // Or better, just call worker.queue with the same key again.
    await worker.queue(batch as any, env as any);

    const finalBookCount = await repos.books.count();
    expect(finalBookCount).toBe(initialBookCount);
  }, 120000);

  it("should serve the landing page at root", async () => {
    const env = { 
        DB: testEnv.env.DB, 
        ENVIRONMENT: "development" 
    };
    const res = await worker.fetch(new Request("http://localhost/"), env as any);
    expect(res.status).toBe(200);
  });
});
