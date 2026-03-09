import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import {
  createD1TestEnv,
  disposeD1TestEnv,
  type TestEnv,
} from "library-test-utils";
import {
  createRepositories,
  BookRepository,
  GenreRepository,
  PublisherRepository,
} from "@/index";

describe("index.ts (integration, Miniflare D1)", () => {
  let testEnv: Awaited<ReturnType<typeof createD1TestEnv>>;

  beforeAll(async () => {
    testEnv = await createD1TestEnv();
  });

  afterAll(async () => {
    await disposeD1TestEnv(testEnv);
  });

  it("createRepositories should return all repository instances", () => {
    const repos = createRepositories(testEnv.db);

    expect(repos.books).toBeInstanceOf(BookRepository);
    expect(repos.genres).toBeInstanceOf(GenreRepository);
    expect(repos.publishers).toBeInstanceOf(PublisherRepository);
  });

  it("repositories created via createRepositories should be functional", async () => {
    const repos = createRepositories(testEnv.db);

    // Test a simple operation on each repository to ensure they are correctly bound to the DB
    const book = await repos.books.create({
      title: "Integration Test Book",
      author: "Author",
    });
    expect(book.id).toBeTruthy();
    expect(book.title).toBe("Integration Test Book");

    const genre = await repos.genres.create({
      name: "Integration Test Genre",
    });
    expect(genre.id).toBeTruthy();
    expect(genre.name).toBe("Integration Test Genre");

    const publisher = await repos.publishers.create({
      name: "Integration Test Publisher",
    });
    expect(publisher.id).toBeTruthy();
    expect(publisher.name).toBe("Integration Test Publisher");
  });
});
