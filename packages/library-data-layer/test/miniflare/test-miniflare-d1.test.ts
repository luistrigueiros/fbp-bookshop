import { describe, it } from "bun:test";
import { Miniflare, Log, LogLevel } from "miniflare";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { mkdtemp } from "node:fs/promises";

describe("Miniflare D1 Minimal", () => {
  it("should create a table", async () => {
    const baseTmp = await mkdtemp(join(tmpdir(), "mf-d1-min-"));

    const mf = new Miniflare({
      log: new Log(LogLevel.VERBOSE),
      modules: true,
      script: "export default { fetch(){ return new Response('ok') } }",
      d1Databases: {
        DB: "DB",
      },
      d1Persist: join(baseTmp, "d1"),
      compatibilityDate: "2024-01-01",
    });

    const env = (await mf.getBindings()) as { DB: D1Database };

    console.log("Creating complex table...");
    try {
      // await env.DB.exec("PRAGMA foreign_keys = OFF;");
      const sql = `CREATE TABLE foo (
                id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                name text
            )`.replace(/\n/g, " ");
      await env.DB.exec(sql);
      console.log("Table created.");
    } catch (e) {
      console.error("Failed to create table:", e);
    }

    await mf.dispose();
  });
});
