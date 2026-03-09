import { beforeAll, describe, expect, it, afterAll } from "bun:test";
import { join } from "path";
import worker from "../src/index";
import { createD1TestEnv, disposeD1TestEnv, type TestEnv } from "library-test-utils";
import { createTRPCProxyClient, httpLink } from '@trpc/client';
import type { AppRouter } from '../src/routers/_app';

describe("Library App API Tests", () => {
  let testEnv: TestEnv;
  let trpc: ReturnType<typeof createTRPCProxyClient<AppRouter>>;

  beforeAll(async () => {
    testEnv = await createD1TestEnv({
      bindings: {
        ENVIRONMENT: "test",
      },
      drizzleDirPath: join(process.cwd(), "..", "library-data-layer", "drizzle"),
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
          // @ts-ignore
          fetch: proxyFetch,
        }),
      ],
    });
  }, 60000);

  afterAll(async () => {
    await disposeD1TestEnv(testEnv);
  });

  it("should create and list genres", async () => {
    const created = await trpc.genres.create.mutate({ name: "Fiction" });
    expect(created.name).toBe("Fiction");
    expect(created.id).toBeGreaterThan(0);

    const list = await trpc.genres.list.query();
    expect(list.length).toBe(1);
    expect(list[0].name).toBe("Fiction");
  });

  it("should create and list publishers", async () => {
    const created = await trpc.publishers.create.mutate({ name: "Penguin" });
    expect(created.name).toBe("Penguin");
    expect(created.id).toBeGreaterThan(0);

    const list = await trpc.publishers.list.query();
    expect(list.length).toBe(1);
    expect(list[0].name).toBe("Penguin");
  });

  it("should create, list, and modify books", async () => {
    // Need genre and publisher
    const genre = await trpc.genres.create.mutate({ name: "Sci-Fi" });
    const publisher = await trpc.publishers.create.mutate({ name: "Tor Books" });

    const newBook = await trpc.books.create.mutate({
      title: "Dune",
      author: "Frank Herbert",
      isbn: "978-0441172719",
      genreIds: [genre.id],
      publisherId: publisher.id,
      price: 19.99,
      language: "English"
    });

    expect(newBook.title).toBe("Dune");
    expect(newBook.id).toBeGreaterThan(0);

    const list = await trpc.books.list.query();
    const found = list.data.find(b => b.id === newBook.id);
    expect(found).toBeDefined();
    expect(found?.author).toBe("Frank Herbert");

    const fetched = await trpc.books.getById.query(newBook.id);
    expect(fetched.title).toBe("Dune");

    const updated = await trpc.books.update.mutate({
      id: newBook.id,
      data: {
        title: "Dune: Deluxe Edition",
        author: "Frank Herbert",
        isbn: "978-0441172719",
        genreIds: [genre.id],
        publisherId: publisher.id,
        price: 25.99,
        language: "English"
      }
    });

    expect(updated.title).toBe("Dune: Deluxe Edition");
    expect(updated.price).toBe(25.99);

    await trpc.books.delete.mutate(newBook.id);

    try {
      await trpc.books.getById.query(newBook.id);
      expect(true).toBe(false); // Should not reach here
    } catch (e: any) {
      expect(e.message).toContain("Book not found");
    }
  });
});
