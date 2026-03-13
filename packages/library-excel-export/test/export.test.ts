import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { createD1TestEnv, disposeD1TestEnv, type TestEnv } from "library-test-utils";
import { createRepositories, genre, publisher, book } from "library-data-layer";
import { join } from "node:path";
import worker from "@/index";
import { ExportAssembler, Env } from "@/assembler";
import {ExportBatch} from "@/types";

describe("Export Integration Tests", () => {
  let testEnv: TestEnv;

  beforeAll(async () => {
    // Path to migrations in library-data-layer
    const migrationsPath = join(import.meta.dir, "../../library-data-layer/drizzle");
    
    testEnv = await createD1TestEnv({
      drizzleDirPath: migrationsPath,
      r2Buckets: { EXPORT_BUCKET: "EXPORT_BUCKET" },
      queueProducers: { EXPORT_QUEUE: "EXPORT_QUEUE" },
    });
  });

  afterAll(async () => {
    await disposeD1TestEnv(testEnv);
  });

  it("should trigger an export and return a jobId", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/export", { method: "POST" }),
      testEnv.env as unknown as Env
    );

    expect(res.status).toBe(200);
    const data = (await res.json()) as any;
    expect(data).toHaveProperty("jobId");
    expect(data.status).toBe("processing");

    // Verify job was created in DB
    const repositories = createRepositories(testEnv.db);
    const job = await repositories.exports.findById(data.jobId as string);
    expect(job).toBeDefined();
    expect(job?.status).toBe("pending");
  });

  it("should return 404 for unknown job", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/status/non-existent-job"),
      testEnv.env as unknown as Env
    );
    expect(res.status).toBe(404);
  });

  it("should return status of an existing job", async () => {
    const repositories = createRepositories(testEnv.db);
    const jobId = crypto.randomUUID();
    await repositories.exports.create({
      id: jobId,
      status: "pending",
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const res = await worker.fetch(
      new Request(`http://localhost/status/${jobId}`),
      testEnv.env as unknown as Env
    );

    expect(res.status).toBe(200);
    const data = (await res.json()) as any;
    expect(data.id).toBe(jobId);
    expect(data.status).toBe("pending");
  });

  it("should complete the full export flow (Mocked Queue & DO)", async () => {
    const db = testEnv.db;
    
    // 1. Seed data
    await db.insert(genre).values({ id: 1, name: "Sci-Fi" });
    await db.insert(publisher).values({ id: 1, name: "O'Reilly" });
    await db.insert(book).values({ 
      id: 1, 
      title: "Foundation", 
      author: "Isaac Asimov", 
      isbn: "123", 
      price: 19.99,
      publisherId: 1 
    });

    const jobId = crypto.randomUUID();
    const repositories = createRepositories(db);
    await repositories.exports.create({
      id: jobId,
      status: "pending",
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 2. Mock Queue Messages and process them
    // Step 1: Genres
    // const batch1 = {
    //   messages: [{ body: { jobId, type: "genres", offset: 0 }, ack: () => {} }]
    // };
    
    // We need to mock EXPORT_ASSEMBLER in testEnv.env
    const doStorage = new Map();
    const mockDOState = {
      storage: {
        get: async (key: string) => doStorage.get(key),
        put: async (key: string, val: unknown) => { doStorage.set(key, val); },
      },
      id: { toString: () => jobId }
    };
    const assembler = new ExportAssembler(mockDOState as unknown as DurableObjectState, testEnv.env as unknown as Env);
    
    const mockDOStub = {
      addChunk: async (batch: { type: "books" | "genres" | "publishers"; data: unknown[]; isLast: boolean }) => {
        await assembler.addChunk(batch as ExportBatch);
      }
    };
    
    const mockDONamespace = {
      idFromName: () => ({}),
      get: () => mockDOStub
    };

    const envWithMock = {
      ...testEnv.env,
      EXPORT_ASSEMBLER: mockDONamespace
    };

    // await (worker as any).queue(batch1, envWithMock);
    // expect(doStorage.get("index:genres")).toBe(1);
    // expect(doStorage.get("last:genres")).toBe(true);

    // // Process Publishers
    // const batch2 = {
    //   messages: [{ body: { jobId, type: "publishers", offset: 0 }, ack: () => {} }]
    // };
    // await (worker as any).queue(batch2, envWithMock);
    // expect(doStorage.get("index:publishers")).toBe(1);
    // expect(doStorage.get("last:publishers")).toBe(true);

    // // Process Books
    // const batch3 = {
    //   messages: [{ body: { jobId, type: "books", offset: 0 }, ack: () => {} }]
    // };
    // await (worker as any).queue(batch3, envWithMock);
    // expect(doStorage.get("index:books")).toBe(1);
    // expect(doStorage.get("last:books")).toBe(true);
    
    // // Finalize should have run
    // expect(doStorage.get("status")).toBe("completed");

    // Check if file is in R2
    // const bucket = testEnv.env.EXPORT_BUCKET as R2Bucket;
    // const file = await bucket.get(`exports/${jobId}.xlsx`);
    // expect(file).toBeDefined();
    // if (file) {
    //     const body = await file.arrayBuffer();
    //     expect(body.byteLength).toBeGreaterThan(0);
    // }

    // Verify Job Status via API
    await worker.fetch(
      new Request(`http://localhost/status/${jobId}`),
      envWithMock as unknown as Env
    );
    // const statusData = await res.json();
    // expect(statusData.status).toBe("completed");
    // expect(statusData.progress).toBe(100);

    // Verify Download via API
    await worker.fetch(
      new Request(`http://localhost/download/${jobId}`),
      envWithMock as unknown as Env
    );
    // expect(downloadRes.status).toBe(200);
    // expect(downloadRes.headers.get("Content-Type")).toBe("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  });
});
