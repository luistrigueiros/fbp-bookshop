import { describe, it, expect } from "bun:test";
import { Miniflare } from "miniflare";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { mkdtemp } from "node:fs/promises";
import { initDB, validateDB } from "../src/db";

describe("Database Validation", () => {
  it("should fail validation if tables don't exist", async () => {
    const baseTmp = await mkdtemp(join(tmpdir(), "db-val-fail-"));
    const mf = new Miniflare({
      modules: true,
      script: "export default { fetch(){ return new Response('ok') } }",
      d1Databases: { DB: "DB" },
      d1Persist: join(baseTmp, "d1"),
      compatibilityDate: "2024-01-01",
    });

    const env = (await mf.getBindings()) as { DB: D1Database };
    const db = initDB(env.DB);

    const result = await validateDB(db);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();

    await mf.dispose();
  });

  it("should fail if tables exist but no migrations table", async () => {
    const baseTmp = await mkdtemp(join(tmpdir(), "db-val-no-mig-"));
    const mf = new Miniflare({
      modules: true,
      script: "export default { fetch(){ return new Response('ok') } }",
      d1Databases: { DB: "DB" },
      d1Persist: join(baseTmp, "d1"),
      compatibilityDate: "2024-01-01",
    });

    const env = (await mf.getBindings()) as { DB: D1Database };

    // Create tables but NOT the migrations table
    await env.DB.exec(
      `CREATE TABLE book (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, title text NOT NULL, author text, isbn text, barcode text, price real, language text, gender_id integer, publisher_id integer)`,
    );
    await env.DB.exec(
      `CREATE TABLE gender (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, name text NOT NULL)`,
    );
    await env.DB.exec(
      `CREATE TABLE publisher (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, name text NOT NULL)`,
    );

    const db = initDB(env.DB);
    const result = await validateDB(db);
    expect(result.success).toBe(false);
    expect(result.error).toContain(
      "Migrations table '__drizzle_migrations' not found",
    );

    await mf.dispose();
  });

  it("should pass validation if tables exist and migrations run", async () => {
    const baseTmp = await mkdtemp(join(tmpdir(), "db-val-pass-"));
    const mf = new Miniflare({
      modules: true,
      script: "export default { fetch(){ return new Response('ok') } }",
      d1Databases: { DB: "DB" },
      d1Persist: join(baseTmp, "d1"),
      compatibilityDate: "2024-01-01",
    });

    const env = (await mf.getBindings()) as { DB: D1Database };

    // Let's see if we can simplify this
    await env.DB.exec(
      `CREATE TABLE book (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, title text NOT NULL, author text, isbn text, barcode text, price real, language text, gender_id integer, publisher_id integer)`,
    );
    await env.DB.exec(
      `CREATE TABLE gender (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, name text NOT NULL)`,
    );
    await env.DB.exec(
      `CREATE TABLE publisher (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, name text NOT NULL)`,
    );
    await env.DB.exec(
      `CREATE TABLE __drizzle_migrations (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, name text NOT NULL, created_at integer)`,
    );
    await env.DB.exec(
      `INSERT INTO __drizzle_migrations (name, created_at) VALUES ('0000_rainy_smasher', 123456789)`,
    );

    const db = initDB(env.DB);
    const result = await validateDB(db);
    expect(result.success).toBe(true);

    await mf.dispose();
  });
});
