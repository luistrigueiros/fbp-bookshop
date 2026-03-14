import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { createD1TestEnv, disposeD1TestEnv, type TestEnv } from "library-test-utils";
import { createRepositories } from "library-data-layer";
import { join } from "node:path";
import worker from "@/index";
import { Env } from "@/assembler";

describe("Export API Tests", () => {
  let testEnv: TestEnv;

  beforeAll(async () => {
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
});
