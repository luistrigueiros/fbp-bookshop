import { Miniflare } from "miniflare";
import { mkdtemp, readdir } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { initDB, runMigrations, splitMigrationStatements, setupLogging, type DB } from "@/index";

type TestEnv = {
  mf: Miniflare;
  env: { DB: D1Database };
  db: DB;
};

async function readMigrationsSql(drizzleDirPath: string): Promise<string[]> {
  const entries = await readdir(drizzleDirPath, { withFileTypes: true });

  const sqlFiles = entries
    .filter((e) => e.isFile() && e.name.endsWith(".sql"))
    .map((e) => e.name)
    .sort((a, b) => a.localeCompare(b));

  const statements: string[] = [];
  for (const f of sqlFiles) {
    const content = await Bun.file(join(drizzleDirPath, f)).text();
    statements.push(...splitMigrationStatements(content));
  }

  return statements;
}

export async function createD1TestEnv(options?: {
  drizzleDirPath?: string;
}): Promise<TestEnv> {
  await setupLogging();
  const drizzleDirPath =
    options?.drizzleDirPath ?? join(process.cwd(), "drizzle");
  const baseTmp = await mkdtemp(join(tmpdir(), "mf-d1-"));

  const mf = new Miniflare({
    modules: true,
    script: "export default { fetch(){ return new Response('ok') } }",
    d1Databases: {
      DB: "DB",
    },
    d1Persist: join(baseTmp, "d1"),
    compatibilityDate: "2024-01-01",
  });

  const env = (await mf.getBindings()) as unknown as { DB: D1Database };

  // Disable foreign keys for migrations
  await env.DB.exec("PRAGMA foreign_keys = OFF;");

  // Apply migrations using shared utility
  const migrationSqlList = await readMigrationsSql(drizzleDirPath);
  await runMigrations(env.DB, migrationSqlList);

  await env.DB.exec("PRAGMA foreign_keys = ON;");

  const db = initDB(env.DB);

  return { mf, env, db };
}

export async function disposeD1TestEnv(testEnv: TestEnv) {
  await testEnv.mf.dispose();
}
