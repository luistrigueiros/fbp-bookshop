import { describe, it, expect, beforeAll, afterAll } from "bun:test";

import { createD1TestEnv, disposeD1TestEnv } from "../utils/d1-test-env";
import {
  BookRepository,
  GenderRepository,
  PublisherRepository,
} from "../../src";

describe("BookRepository (integration, Miniflare D1)", () => {
  let testEnv: Awaited<ReturnType<typeof createD1TestEnv>>;
  let books: BookRepository;
  let genders: GenderRepository;
  let publishers: PublisherRepository;

  beforeAll(async () => {
    testEnv = await createD1TestEnv();
    books = new BookRepository(testEnv.db);
    genders = new GenderRepository(testEnv.db);
    publishers = new PublisherRepository(testEnv.db);
  });

  afterAll(async () => {
    await disposeD1TestEnv(testEnv);
  });

  it("CRUD operations", async () => {
    const created = await books.create({
      title: "Test Book",
      author: "Test Author",
      isbn: "1234567890",
      barcode: "B123",
      price: 29.99,
      language: "English",
    });
    expect(created.id).toBeTruthy();
    expect(created.title).toBe("Test Book");

    const byId = await books.findById(created.id);
    expect(byId?.title).toBe("Test Book");

    const updated = await books.update(created.id, { title: "Updated Title" });
    expect(updated?.title).toBe("Updated Title");

    const deleted = await books.delete(created.id);
    expect(deleted).toBe(true);

    const afterDelete = await books.findById(created.id);
    expect(afterDelete).toBeUndefined();
  });

  it("Search by title or author", async () => {
    await books.create({ title: "Unique Title", author: "Common Author" });
    await books.create({ title: "Common Title", author: "Unique Author" });

    const searchTitle = await books.search("Unique Title");
    expect(searchTitle.length).toBe(1);
    expect(searchTitle[0]?.title).toBe("Unique Title");

    const searchAuthor = await books.search("Unique Author");
    expect(searchAuthor.length).toBe(1);
    expect(searchAuthor[0]?.author).toBe("Unique Author");

    const searchCommon = await books.search("Common");
    expect(searchCommon.length).toBe(2);
  });

  it("Find with relations", async () => {
    const g = await genders.create({ name: "Fiction" });
    const p = await publishers.create({ name: "Big Publisher" });

    const b = await books.create({
      title: "Relational Book",
      author: "Author",
      genderId: g.id,
      publisherId: p.id,
    });

    const withRel = await books.findByIdWithRelations(b.id);
    expect(withRel?.gender?.name).toBe("Fiction");
    expect(withRel?.publisher?.name).toBe("Big Publisher");

    const allWithRel = await books.findAllWithRelations();
    expect(allWithRel.some((x) => x.id === b.id && x.gender?.id === g.id)).toBe(
      true,
    );
  });

  it("Find by gender and publisher ID", async () => {
    const g = await genders.create({ name: "Sci-Fi" });
    const p = await publishers.create({ name: "Tech Press" });

    await books.create({ title: "B1", author: "A1", genderId: g.id });
    await books.create({ title: "B2", author: "A2", publisherId: p.id });

    const byGender = await books.findByGenderId(g.id);
    expect(byGender.length).toBe(1);
    expect(byGender[0]?.title).toBe("B1");

    const byPublisher = await books.findByPublisherId(p.id);
    expect(byPublisher.length).toBe(1);
    expect(byPublisher[0]?.title).toBe("B2");
  });

  it("Additional coverage cases", async () => {
    // Find by ISBN
    const b1 = await books.create({
      title: "ISBN Book",
      author: "A1",
      isbn: "999-000",
    });
    const byIsbn = await books.findByIsbn("999-000");
    expect(byIsbn?.id).toBe(b1.id);

    // Find by Barcode
    const b2 = await books.create({
      title: "Barcode Book",
      author: "A2",
      barcode: "CODE123",
    });
    const byBarcode = await books.findByBarcode("CODE123");
    expect(byBarcode?.id).toBe(b2.id);

    // Find all and Count
    const initialCount = await books.count();
    const allBooks = await books.findAll();
    expect(allBooks.length).toBe(initialCount);

    // Negative cases (non-existent ID)
    const nonExistentId = 999999;

    expect(await books.findById(nonExistentId)).toBeUndefined();
    expect(await books.findByIdWithRelations(nonExistentId)).toBeUndefined();
    expect(await books.update(nonExistentId, { title: "No" })).toBeUndefined();
    expect(await books.delete(nonExistentId)).toBe(false);
  });
});
