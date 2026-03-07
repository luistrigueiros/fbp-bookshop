import { Miniflare } from "miniflare";
import { mkdtemp, readdir } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { initDB, type DB } from "@/index";

type TestEnv = {
  mf: Miniflare;
  env: { DB: D1Database };
  db: DB;
};

async function readMigrationsSql(drizzleDirPath: string): Promise<string[]> {
  // Drizzle generates .sql migration files in drizzle/
  const entries = await readdir(drizzleDirPath, { withFileTypes: true });

  const sqlFiles = entries
    .filter((e) => e.isFile() && e.name.endsWith(".sql"))
    .map((e) => e.name)
    // Sort by filename to preserve migration order
    .sort((a, b) => a.localeCompare(b));

  const fileContents = await Promise.all(
    sqlFiles.map((f) => Bun.file(join(drizzleDirPath, f)).text()),
  );

  // Flatten all statements
  return fileContents
    .flatMap((content) => content.split("--> statement-breakpoint"))
    .map((stmt) => stmt.trim().replace(/\n/g, " "))
    .filter((stmt) => stmt.length > 0);
}

export async function createD1TestEnv(options?: {
  drizzleDirPath?: string;
}): Promise<TestEnv> {
  const drizzleDirPath =
    options?.drizzleDirPath ?? join(process.cwd(), "drizzle");
  const baseTmp = await mkdtemp(join(tmpdir(), "mf-d1-"));

  // Persist path makes D1 use SQLite on disk (still local), which is reliable for integration tests.
  // Each test env gets its own temp directory -> isolated DB.
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

  // Disable foreign keys for migrations as they might be out of order (circular dependencies etc)
  await env.DB.exec("PRAGMA foreign_keys = OFF;");

  // Apply migrations
  const migrationSqlList = await readMigrationsSql(drizzleDirPath);
  for (const sql of migrationSqlList) {
    // D1Database.exec runs raw SQL against the SQLite database.
    await env.DB.exec(sql);
  }

  await env.DB.exec("PRAGMA foreign_keys = ON;");

  const db = initDB(env.DB);

  return { mf, env, db };
}

export async function disposeD1TestEnv(testEnv: TestEnv) {
  await testEnv.mf.dispose();
}
