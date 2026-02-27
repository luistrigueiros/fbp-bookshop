import { Database } from "bun:sqlite";
import { readFileSync } from "fs";

const sqlContent = readFileSync("drizzle/0000_aspiring_lake.sql", "utf-8");
// Split by breakpoint
const statements = sqlContent
  .split("--> statement-breakpoint")
  .map((stmt) => stmt.trim())
  .filter((stmt) => stmt.length > 0);

const db = new Database(":memory:");

try {
  // Enable/Disable FKs?
  // db.query("PRAGMA foreign_keys = OFF;").run();

  for (const sql of statements) {
    console.log("Executing:", sql.substring(0, 50) + "...");
    db.query(sql).run();
  }
  console.log("Success!");
} catch (e) {
  console.error("SQL Error:", e);
}
