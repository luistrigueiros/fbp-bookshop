import { Miniflare } from "miniflare";
import { mkdtemp, readdir } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { initDB, runMigrations, splitMigrationStatements, setupLogging, type DB } from "library-data-layer";

export interface TestEnv {
  mf: Miniflare;
  env: { 
    DB: D1Database;
    UPLOADS_BUCKET?: R2Bucket;
    UPLOAD_QUEUE?: Queue<any>;
  } & Record<string, any>;
  db: DB;
  /**
   * Re-acquires fresh bindings from the Miniflare instance.
   * Useful to avoid "poisoned stub" errors in long-running tests.
   */
  getBindings(): Promise<Record<string, any>>;
}

async function readMigrationsSql(drizzleDirPath: string): Promise<string[]> {
  try {
    const entries = await readdir(drizzleDirPath, { withFileTypes: true });

    const sqlFiles = entries
      .filter((e) => e.isFile() && e.name.endsWith(".sql"))
      .map((e) => e.name)
      .sort((a: string, b: string) => a.localeCompare(b));

    const statements: string[] = [];
    for (const f of sqlFiles) {
      const content = await Bun.file(join(drizzleDirPath, f)).text();
      statements.push(...splitMigrationStatements(content));
    }

    return statements;
  } catch (err) {
    // It's okay if migrations don't exist in some cases
    return [];
  }
}

/**
 * Creates a Miniflare environment with a D1 database and applies migrations.
 */
export async function createD1TestEnv(options?: {
  drizzleDirPath?: string;
  script?: string;
  scriptPath?: string;
  bindings?: Record<string, any>;
  compatibilityDate?: string;
  r2Buckets?: Record<string, string>;
  queueProducers?: Record<string, string>;
  queueConsumers?: Record<string, { maxBatchSize?: number; maxBatchTimeout?: number }>;
}): Promise<TestEnv> {
  await setupLogging();
  
  const drizzleDirPath =
    options?.drizzleDirPath ?? join(process.cwd(), "drizzle");
  
  const baseTmp = await mkdtemp(join(tmpdir(), "mf-d1-"));

  const mf = new Miniflare({
    modules: true,
    script: options?.script ?? "export default { fetch(){ return new Response('ok') } }",
    scriptPath: options?.scriptPath,
    d1Databases: {
      DB: "DB",
    },
    d1Persist: join(baseTmp, "d1"),
    r2Buckets: options?.r2Buckets,
    r2Persist: join(baseTmp, "r2"),
    queueProducers: options?.queueProducers,
    queueConsumers: options?.queueConsumers,
    compatibilityDate: options?.compatibilityDate ?? "2024-01-01",
    compatibilityFlags: ["nodejs_compat"],
    bindings: options?.bindings,
  });

  const env = (await mf.getBindings()) as unknown as { DB: D1Database } & Record<string, any>;

  // Disable foreign keys for migrations
  await env.DB.exec("PRAGMA foreign_keys = OFF;");

  // Apply migrations
  const migrationSqlList = await readMigrationsSql(drizzleDirPath);
  if (migrationSqlList.length > 0) {
    await runMigrations(env.DB, migrationSqlList);
  }

  await env.DB.exec("PRAGMA foreign_keys = ON;");

  const db = initDB(env.DB);
  const getBindings = () => mf.getBindings();

  return { mf, env, db, getBindings };
}

/**
 * Disposes of the Miniflare environment.
 */
export async function disposeD1TestEnv(testEnv: TestEnv) {
  await testEnv.mf.dispose();
}
