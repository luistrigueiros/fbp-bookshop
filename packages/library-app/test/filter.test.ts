import { beforeAll, describe, expect, it, afterAll } from "bun:test";
import { join } from "path";
import worker from "@/index";
import { createD1TestEnv, disposeD1TestEnv, type TestEnv } from "library-test-utils";
import { createTRPCProxyClient, httpLink } from '@trpc/client';
import type { AppRouter } from 'library-trpc';

describe("Library App Filtering API Tests", () => {
  let testEnv: TestEnv;
  let trpc: ReturnType<typeof createTRPCProxyClient<AppRouter>>;

  beforeAll(async () => {
    const drizzleDirPath = join(import.meta.dir, "..", "..", "library-data-layer", "drizzle");
    testEnv = await createD1TestEnv({
      bindings: {
        ENVIRONMENT: "test",
      },
      drizzleDirPath,
    });

    const proxyFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const req = new Request(input, init);
      const env = { 
        DB: testEnv.env.DB, 
        ENVIRONMENT: "test",
      };
      return worker.fetch(req, env as any);
    };

    trpc = createTRPCProxyClient<AppRouter>({
      links: [
        httpLink({
          url: 'http://localhost/api',
          fetch: proxyFetch,
        }),
      ],
    });
  }, 60000);

  afterAll(async () => {
    await disposeD1TestEnv(testEnv);
  });

  it("should filter books by genre and publisher via API (simulating frontend logic)", async () => {
    // 1. Setup data
    const genre1 = await trpc.genres.create.mutate({ name: "Genre 1" });
    const genre2 = await trpc.genres.create.mutate({ name: "Genre 2" });
    const pub1 = await trpc.publishers.create.mutate({ name: "Publisher 1" });
    const pub2 = await trpc.publishers.create.mutate({ name: "Publisher 2" });

    // Book 1: Genre 1, Pub 1
    await trpc.books.create.mutate({
      title: "Book G1 P1",
      author: "Author A",
      genreIds: [genre1.id],
      publisherId: pub1.id,
      price: 10,
      language: "English",
      stock: { bookshelf: "A1", numberOfCopies: 1, numberOfCopiesSold: 0 }
    });

    // Book 2: Genre 2, Pub 2
    await trpc.books.create.mutate({
      title: "Book G2 P2",
      author: "Author B",
      genreIds: [genre2.id],
      publisherId: pub2.id,
      price: 20,
      language: "French",
      stock: { bookshelf: "B1", numberOfCopies: 2, numberOfCopiesSold: 0 }
    });

    // 2. Test filtering (this is what the frontend does with query params)
    
    // Filter by Genre 1
    const listG1 = await trpc.books.list.query({ genreId: genre1.id });
    expect(listG1.data.length).toBe(1);
    expect(listG1.data[0].title).toBe("Book G1 P1");

    // Filter by Genre 2
    const listG2 = await trpc.books.list.query({ genreId: genre2.id });
    expect(listG2.data.length).toBe(1);
    expect(listG2.data[0].title).toBe("Book G2 P2");

    // Filter by Publisher 1
    const listP1 = await trpc.books.list.query({ publisherId: pub1.id });
    expect(listP1.data.length).toBe(1);
    expect(listP1.data[0].title).toBe("Book G1 P1");

    // Filter by Publisher 2
    const listP2 = await trpc.books.list.query({ publisherId: pub2.id });
    expect(listP2.data.length).toBe(1);
    expect(listP2.data[0].title).toBe("Book G2 P2");
    
    // Filter by both (none should match if mismatched)
    const listMismatched = await trpc.books.list.query({ genreId: genre1.id, publisherId: pub2.id });
    expect(listMismatched.data.length).toBe(0);
  });

  it("should get the list of unique languages from books", async () => {
    // 1. Setup more data with different languages
    const pub = await trpc.publishers.create.mutate({ name: "Publisher Languages" });
    
    await trpc.books.create.mutate({
      title: "English Book",
      language: "English",
      publisherId: pub.id,
      price: 10
    });
    
    await trpc.books.create.mutate({
      title: "French Book",
      language: "French",
      publisherId: pub.id,
      price: 15
    });

    await trpc.books.create.mutate({
      title: "Another English Book",
      language: "English",
      publisherId: pub.id,
      price: 12
    });

    await trpc.books.create.mutate({
      title: "Empty Language Book",
      language: "",
      publisherId: pub.id,
      price: 5
    });

    // 2. Get languages
    const languages = await trpc.books.getLanguages.query();
    
    // 3. Verify
    expect(languages).toContain("English");
    expect(languages).toContain("French");
    // Should not contain empty string (based on our repository implementation)
    expect(languages).not.toContain("");
    // Should be unique
    const englishCount = languages.filter(l => l === "English").length;
    expect(englishCount).toBe(1);
  });
});
