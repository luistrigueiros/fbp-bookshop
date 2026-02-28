import { describe, it, expect } from "bun:test";
import { extractGender, extractPublisher, extractBook } from '../src';
import type { Gender, Publisher } from '../src';
import { existsSync } from "node:fs";

// Path to the Excel fixture — adjust if needed
const FIXTURE = "./FBP-DB.xlsx";

const hasFixture = existsSync(FIXTURE);

describe("extractGender", () => {
  it("returns a non-empty list of unique genders", () => {
    if (!hasFixture) {
      console.warn("Skipping: FBP-DB.xlsx not found");
      return;
    }
    const result = extractGender(FIXTURE);
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.count).toBe(result.items.length);
  });

  it("assigns unique IDs to every gender", () => {
    if (!hasFixture) return;
    const { items } = extractGender(FIXTURE);
    const ids = items.map((g: Gender) => g.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("has no duplicate names (case-insensitive)", () => {
    if (!hasFixture) return;
    const { items } = extractGender(FIXTURE);
    const names = items.map((g: Gender) => g.name.toLowerCase());
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(names.length);
  });
});

describe("extractPublisher", () => {
  it("returns a non-empty list of unique publishers", () => {
    if (!hasFixture) return;
    const result = extractPublisher(FIXTURE);
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.count).toBe(result.items.length);
  });

  it("assigns unique IDs to every publisher", () => {
    if (!hasFixture) return;
    const { items } = extractPublisher(FIXTURE);
    const ids = items.map((p: Publisher) => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("has no duplicate names (case-insensitive)", () => {
    if (!hasFixture) return;
    const { items } = extractPublisher(FIXTURE);
    const names = items.map((p: Publisher) => p.name.toLowerCase());
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(names.length);
  });
});

describe("extractBook", () => {
  it("returns a non-empty list of books", () => {
    if (!hasFixture) return;
    const result = extractBook(FIXTURE);
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.count).toBe(result.items.length);
  });

  it("every book has a title", () => {
    if (!hasFixture) return;
    const { items } = extractBook(FIXTURE);
    for (const book of items) {
      expect(book.title).toBeTruthy();
    }
  });

  it("books with a gender reference a known gender", () => {
    if (!hasFixture) return;
    const { items: genders } = extractGender(FIXTURE);
    const genderNames = new Set(genders.map((g: Gender) => g.name.toLowerCase()));
    const { items: books } = extractBook(FIXTURE);

    for (const book of books) {
      if (book.gender !== null) {
        expect(genderNames.has(book.gender.name.toLowerCase())).toBe(true);
      }
    }
  });

  it("books with a publisher reference a known publisher", () => {
    if (!hasFixture) return;
    const { items: publishers } = extractPublisher(FIXTURE);
    const publisherNames = new Set(publishers.map((p: Publisher) => p.name.toLowerCase()));
    const { items: books } = extractBook(FIXTURE);

    for (const book of books) {
      if (book.publisher !== null) {
        expect(publisherNames.has(book.publisher.name.toLowerCase())).toBe(true);
      }
    }
  });

  it("no duplicate books by isbn+title", () => {
    if (!hasFixture) return;
    const { items } = extractBook(FIXTURE);
    const seen = new Set<string>();
    for (const book of items) {
      if (book.isbn) {
        const key = `${book.title.toLowerCase()}|${book.isbn}`;
        expect(seen.has(key)).toBe(false);
        seen.add(key);
      }
    }
  });
});
