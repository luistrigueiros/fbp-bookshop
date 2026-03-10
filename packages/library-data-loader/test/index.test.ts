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

  it("should serve the landing page at root", async () => {
    const currentBindings = await testEnv.getBindings() as any;
    const env = {
      DB: currentBindings.DB,
      ENVIRONMENT: "development"
    };
    const res = await worker.fetch(new Request("http://localhost/"), env as any);
    expect(res.status).toBe(200);
  });

  it("should accept the Excel file and eventually store data in D1", async () => {
    // 1. Submit the upload request
    const currentBindings = await testEnv.getBindings() as any;
    const env = { 
      DB: currentBindings.DB, 
      UPLOADS_BUCKET: currentBindings.UPLOADS_BUCKET,
      UPLOAD_QUEUE: currentBindings.UPLOAD_QUEUE,
      BOOK_QUEUE: {
          send: async (msg: any) => {
              // Re-acquire fresh bindings inside simulated queue if needed
              const freshBindings = await testEnv.getBindings() as any;
              // Simulate immediate processing of the book message
              await worker.queue({
                  messages: [{
                      id: "book-msg-" + Math.random(),
                      body: msg,
                      ack: () => {},
                      retry: () => {},
                  }]
              } as any, { 
                ...freshBindings,
                BOOK_QUEUE: (await testEnv.getBindings() as any).BOOK_QUEUE // This is recursive if we're not careful, but BOOK_QUEUE is simulated here
              } as any);
          }
      },
      ENVIRONMENT: "development" 
    };
    
    const filePath = join(__dirname, "FBP-DB.xlsx");
    const fileContent = readFileSync(filePath);

    const formData = new FormData();
    const blob = new Blob([fileContent], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    formData.append("file", blob, "FBP-DB.xlsx");

    const req = new Request("http://localhost/upload", {
      method: "POST",
      body: formData,
    });

    const res = await worker.fetch(req, env as any);

    const json = (await res.json()) as { message: string; key: string };
    expect(res.status).toBe(202);
    
    const key = json.key;

    // 2. Manually trigger the queue handler to simulate background processing
    // Re-acquire bindings for the queue handler call
    const freshBindingsForQueue = await testEnv.getBindings() as any;
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

    await worker.queue(batch as any, { ...env, ...freshBindingsForQueue } as any);

    // Verify final status
    // Re-acquire bindings for the status check
    const freshBindingsForStatus = await testEnv.getBindings() as any;
    const finalStatusRes = await worker.fetch(new Request(`http://localhost/upload-status/${key}`), { ...env, ...freshBindingsForStatus } as any);
    const finalStatusJson = await finalStatusRes.json() as any;
    
    if (finalStatusJson.status !== UploadStatus.PROCESSED_SUCCESSFULLY) {
        writeFileSync(join(process.cwd(), "test_error.json"), JSON.stringify(finalStatusJson, null, 2));
    }
    
    expect(finalStatusJson.status).toBe(UploadStatus.PROCESSED_SUCCESSFULLY);

    // 3. Repeat the process to verify upsert (no duplicates)
    // Re-acquire bindings for the upsert check
    const freshBindingsForUpsert = await testEnv.getBindings() as any;
    const drizzleDB = (await import("library-data-layer")).initDB(freshBindingsForUpsert.DB);
    const repos = createRepositories(drizzleDB);
    const initialBookCount = await repos.books.count();
    const initialGenreCount = await repos.genres.count();
    const initialPublisherCount = await repos.publishers.count();
    
    // Simulate second upload of the same file
    // Re-acquire bindings for the second queue handler call
    const freshBindingsForQueue2 = await testEnv.getBindings() as any;
    await worker.queue({
      messages: [{
        id: "test-msg-2",
        timestamp: new Date(),
        body: { key: json.key, filename: "FBP-DB.xlsx" }, // Use SAME key to reuse the same data
        ack: () => {},
        retry: () => {},
      }],
      queue: "library-upload-queue",
    } as any, { ...env, ...freshBindingsForQueue2 } as any);

    const finalBookCount = await repos.books.count();
    const finalGenreCount = await repos.genres.count();
    const finalPublisherCount = await repos.publishers.count();

    expect(finalBookCount).toBe(initialBookCount);
    expect(finalGenreCount).toBe(initialGenreCount);
    expect(finalPublisherCount).toBe(initialPublisherCount);
  }, 120000);
});
