import { describe, it, expect } from "bun:test";
import * as schema from "@/schema";
import path from "path";
import { createD1TestEnv, disposeD1TestEnv } from "library-test-utils";

describe("Schema Definitions", () => {
  it("should have gender table defined correctly", () => {
    expect(schema.gender).toBeDefined();
    expect(schema.gender.id).toBeDefined();
    expect(schema.gender.name).toBeDefined();
  });

  it("should have publisher table defined correctly", () => {
    expect(schema.publisher).toBeDefined();
    expect(schema.publisher.id).toBeDefined();
    expect(schema.publisher.name).toBeDefined();
  });

  it("should have book table defined correctly", () => {
    expect(schema.book).toBeDefined();
    expect(schema.book.id).toBeDefined();
    expect(schema.book.title).toBeDefined();
    expect(schema.book.author).toBeDefined();
    expect(schema.book.isbn).toBeDefined();
    expect(schema.book.barcode).toBeDefined();
    expect(schema.book.price).toBeDefined();
    expect(schema.book.language).toBeDefined();
    expect(schema.book.genderId).toBeDefined();
    expect(schema.book.publisherId).toBeDefined();
  });

  it("should exercise relation definitions", () => {
    // These calls trigger the arrow functions passed to relations()
    expect(schema.bookRelations).toBeDefined();
    expect(schema.genderRelations).toBeDefined();
    expect(schema.publisherRelations).toBeDefined();
  });

  it("should exercise references functions", () => {
    expect(schema.getGenderId()).toBeDefined();
    expect(schema.getPublisherId()).toBeDefined();
  });

  it("should cover D1 test env options branch", async () => {
    // This covers line 34 in test/utils/d1-test-env.ts: drizzleDirPath?: string;
    // By passing an explicit drizzleDirPath
    const drizzlePath = path.join(process.cwd(), "drizzle");
    const testEnv = await createD1TestEnv({ drizzleDirPath: drizzlePath });
    expect(testEnv).toBeDefined();
    await disposeD1TestEnv(testEnv);
  });
});
