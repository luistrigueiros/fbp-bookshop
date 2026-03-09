import { describe, it, expect, beforeAll, afterAll } from "bun:test";

import {
  createD1TestEnv,
  disposeD1TestEnv,
  type TestEnv,
} from "library-test-utils";
import { GenreRepository, BookRepository } from "@/index";

describe("GenreRepository (integration, Miniflare D1)", () => {
  let testEnv: Awaited<ReturnType<typeof createD1TestEnv>>;
  let genres: GenreRepository;
  let books: BookRepository;

  beforeAll(async () => {
    testEnv = await createD1TestEnv();
    genres = new GenreRepository(testEnv.db);
    books = new BookRepository(testEnv.db);
  });

  afterAll(async () => {
    await disposeD1TestEnv(testEnv);
  });

  it("CRUD + count", async () => {
    const created = await genres.create({ name: "Science Fiction" });
    expect(created.id).toBeTruthy();
    expect(created.name).toBe("Science Fiction");

    const byId = await genres.findById(created.id);
    expect(byId?.name).toBe("Science Fiction");

    const byName = await genres.findByName("Science Fiction");
    expect(byName?.id).toBe(created.id);

    const all = await genres.findAll();
    expect(all.length).toBeGreaterThanOrEqual(1);

    const searched = await genres.search("Science");
    expect(searched.some((g) => g.id === created.id)).toBe(true);

    const updated = await genres.update(created.id, { name: "Sci-Fi" });
    expect(updated?.name).toBe("Sci-Fi");

    const countBeforeDelete = await genres.count();
    expect(countBeforeDelete).toBeGreaterThanOrEqual(1);

    const deleted = await genres.delete(created.id);
    expect(deleted).toBe(true);

    const afterDelete = await genres.findById(created.id);
    expect(afterDelete).toBeUndefined();
  });

  it("findByIdWithBooks returns books relation", async () => {
    const g = await genres.create({ name: "Mystery" });

    const b = await books.create({
      title: "The Mystery Book",
      author: "A. Author",
      isbn: "ISBN-MYSTERY-1",
      barcode: "BARCODE-MYSTERY-1",
      price: 9.99,
      language: "English",
      genreIds: [g.id],
      publisherId: null,
    });

    const withBooks = await genres.findByIdWithBooks(g.id);
    expect(withBooks?.id).toBe(g.id);
    expect(Array.isArray(withBooks?.books)).toBe(true);
    expect(withBooks?.books?.some((x) => x.id === b.id)).toBe(true);
  });

  it("findAllWithBooks returns all genres with books relation", async () => {
    const name = `Genre ${Date.now()}`;
    const g = await genres.create({ name });

    await books.create({
      title: "Related Book",
      author: "Author",
      isbn: `ISBN-${Date.now()}`,
      barcode: `BARCODE-${Date.now()}`,
      price: 10,
      language: "English",
      genreIds: [g.id],
      publisherId: null,
    });

    const allWithBooks = await genres.findAllWithBooks();
    const found = allWithBooks.find((x) => x.id === g.id);

    expect(found).toBeDefined();
    expect(found?.name).toBe(name);
    expect(Array.isArray(found?.books)).toBe(true);
    expect(found?.books?.length).toBeGreaterThan(0);
  });
});
