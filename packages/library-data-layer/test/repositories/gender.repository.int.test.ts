import { describe, it, expect, beforeAll, afterAll } from "bun:test";

import { createD1TestEnv, disposeD1TestEnv } from "../utils/d1-test-env";
import { GenderRepository, BookRepository } from "../../src";

describe("GenderRepository (integration, Miniflare D1)", () => {
  let testEnv: Awaited<ReturnType<typeof createD1TestEnv>>;
  let genders: GenderRepository;
  let books: BookRepository;

  beforeAll(async () => {
    testEnv = await createD1TestEnv();
    genders = new GenderRepository(testEnv.db);
    books = new BookRepository(testEnv.db);
  });

  afterAll(async () => {
    await disposeD1TestEnv(testEnv);
  });

  it("CRUD + count", async () => {
    const created = await genders.create({ name: "Science Fiction" });
    expect(created.id).toBeTruthy();
    expect(created.name).toBe("Science Fiction");

    const byId = await genders.findById(created.id);
    expect(byId?.name).toBe("Science Fiction");

    const byName = await genders.findByName("Science Fiction");
    expect(byName?.id).toBe(created.id);

    const all = await genders.findAll();
    expect(all.length).toBeGreaterThanOrEqual(1);

    const searched = await genders.search("Science");
    expect(searched.some((g) => g.id === created.id)).toBe(true);

    const updated = await genders.update(created.id, { name: "Sci-Fi" });
    expect(updated?.name).toBe("Sci-Fi");

    const countBeforeDelete = await genders.count();
    expect(countBeforeDelete).toBeGreaterThanOrEqual(1);

    const deleted = await genders.delete(created.id);
    expect(deleted).toBe(true);

    const afterDelete = await genders.findById(created.id);
    expect(afterDelete).toBeUndefined();
  });

  it("findByIdWithBooks returns books relation", async () => {
    const g = await genders.create({ name: "Mystery" });

    const b = await books.create({
      title: "The Mystery Book",
      author: "A. Author",
      isbn: "ISBN-MYSTERY-1",
      barcode: "BARCODE-MYSTERY-1",
      price: 9.99,
      language: "English",
      genderId: g.id,
      publisherId: null,
    });

    const withBooks = await genders.findByIdWithBooks(g.id);
    expect(withBooks?.id).toBe(g.id);
    expect(Array.isArray(withBooks?.books)).toBe(true);
    expect(withBooks?.books?.some((x) => x.id === b.id)).toBe(true);
  });

  it("findAllWithBooks returns all genders with books relation", async () => {
    const name = `Genre ${Date.now()}`;
    const g = await genders.create({ name });

    await books.create({
      title: "Related Book",
      author: "Author",
      isbn: `ISBN-${Date.now()}`,
      barcode: `BARCODE-${Date.now()}`,
      price: 10,
      language: "English",
      genderId: g.id,
      publisherId: null,
    });

    const allWithBooks = await genders.findAllWithBooks();
    const found = allWithBooks.find((x) => x.id === g.id);

    expect(found).toBeDefined();
    expect(found?.name).toBe(name);
    expect(Array.isArray(found?.books)).toBe(true);
    expect(found?.books?.length).toBeGreaterThan(0);
  });
});
