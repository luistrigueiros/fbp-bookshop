import { describe, it, expect, beforeAll, afterAll } from "bun:test";

import { createD1TestEnv, disposeD1TestEnv } from "../utils/d1-test-env";
import { PublisherRepository, BookRepository } from "../../src";

describe("PublisherRepository (integration, Miniflare D1)", () => {
  let testEnv: Awaited<ReturnType<typeof createD1TestEnv>>;
  let publishers: PublisherRepository;
  let books: BookRepository;

  beforeAll(async () => {
    testEnv = await createD1TestEnv();
    publishers = new PublisherRepository(testEnv.db);
    books = new BookRepository(testEnv.db);
  });

  afterAll(async () => {
    await disposeD1TestEnv(testEnv);
  });

  it("CRUD + search + count", async () => {
    const created = await publishers.create({ name: "Penguin" });
    expect(created.id).toBeTruthy();
    expect(created.name).toBe("Penguin");

    const byId = await publishers.findById(created.id);
    expect(byId?.id).toBe(created.id);

    const byName = await publishers.findByName("Penguin");
    expect(byName?.id).toBe(created.id);

    const all = await publishers.findAll();
    expect(all.length).toBeGreaterThanOrEqual(1);

    const searched = await publishers.search("Peng");
    expect(searched.some((p) => p.id === created.id)).toBe(true);

    const updated = await publishers.update(created.id, {
      name: "Penguin Random House",
    });
    expect(updated?.name).toBe("Penguin Random House");

    const countBeforeDelete = await publishers.count();
    expect(countBeforeDelete).toBeGreaterThanOrEqual(1);

    const deleted = await publishers.delete(created.id);
    expect(deleted).toBe(true);

    const afterDelete = await publishers.findById(created.id);
    expect(afterDelete).toBeUndefined();
  });

  it("findByIdWithBooks + findAllWithBooks returns books relation", async () => {
    const p = await publishers.create({ name: "O'Reilly Media" });

    const b = await books.create({
      title: "Learning SQL",
      author: "A. Query",
      isbn: "ISBN-OREILLY-1",
      barcode: "BARCODE-OREILLY-1",
      price: 19.99,
      language: "English",
      genderId: null,
      publisherId: p.id,
    });

    const withBooks = await publishers.findByIdWithBooks(p.id);
    expect(withBooks?.id).toBe(p.id);
    expect(Array.isArray(withBooks?.books)).toBe(true);
    expect(withBooks?.books?.some((x) => x.id === b.id)).toBe(true);

    const allWithBooks = await publishers.findAllWithBooks();
    expect(allWithBooks.some((x) => x.id === p.id)).toBe(true);
  });
});
