import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { createD1TestEnv, disposeD1TestEnv } from "@test/utils/d1-test-env";
import {
  createRepositories,
  BookRepository,
  GenderRepository,
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
    expect(repos.genders).toBeInstanceOf(GenderRepository);
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

    const gender = await repos.genders.create({
      name: "Integration Test Gender",
    });
    expect(gender.id).toBeTruthy();
    expect(gender.name).toBe("Integration Test Gender");

    const publisher = await repos.publishers.create({
      name: "Integration Test Publisher",
    });
    expect(publisher.id).toBeTruthy();
    expect(publisher.name).toBe("Integration Test Publisher");
  });
});
