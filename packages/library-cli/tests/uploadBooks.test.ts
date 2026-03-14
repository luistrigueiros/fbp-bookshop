import { expect, test, describe, mock, beforeEach } from "bun:test";
import { uploadBooks } from "../src/uploadBooks";
import { validateBooks } from "../src/validateBooks";
import { Book } from "library-excel-extractor";
import { TRPCClient } from "../src/utils";

describe("validateBooks", () => {
  test("should validate correct books", () => {
    const books: Book[] = [
      {
        title: "Book 1",
        author: "Author 1",
        isbn: "123",
        barcode: "123",
        price: 10,
        language: "en",
        genres: [],
        publisher: null,
        bookshelf: "A1",
        numberOfCopies: 10,
        numberOfSoldCopies: 5,
      },
    ];
    const result = validateBooks(books);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("should catch missing title", () => {
    const books: any[] = [{ title: "", numberOfCopies: 10, numberOfSoldCopies: 5 }];
    const result = validateBooks(books);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Row 1: Title is required.");
  });

  test("should catch negative copies", () => {
    const books: any[] = [{ title: "Title", numberOfCopies: -1, numberOfSoldCopies: 0 }];
    const result = validateBooks(books);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Row 1: Number of copies cannot be negative.");
  });

  test("should catch sold copies exceeding total copies", () => {
    const books: any[] = [{ title: "Title", numberOfCopies: 10, numberOfSoldCopies: 15 }];
    const result = validateBooks(books);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Row 1: Number of sold copies (15) cannot exceed number of copies (10).");
  });
});

describe("uploadBooks", () => {
  let mockClient: any;
  const genreMap = new Map();
  const publisherMap = new Map();

  beforeEach(() => {
    mockClient = {
      books: {
        upsert: {
          mutate: mock(() => Promise.resolve({ id: 1 })),
        },
      },
    };
  });

  test("should upload books with stock information", async () => {
    const books: Book[] = [
      {
        title: "Test Book",
        author: "Test Author",
        isbn: "987654321",
        barcode: "barcode",
        price: 20,
        language: "fr",
        genres: [],
        publisher: null,
        bookshelf: "B2",
        numberOfCopies: 50,
        numberOfSoldCopies: 10,
      },
    ];

    await uploadBooks(mockClient as any as TRPCClient, books, genreMap, publisherMap);

    expect(mockClient.books.upsert.mutate).toHaveBeenCalledWith({
      title: "Test Book",
      author: "Test Author",
      isbn: "987654321",
      barcode: "barcode",
      price: 20,
      language: "fr",
      genreIds: [],
      publisherId: null,
      stock: {
        bookshelf: "B2",
        numberOfCopies: 50,
        numberOfCopiesSold: 10,
      },
    });
  });

  test("should use defaults for null stock fields", async () => {
    const books: Book[] = [
      {
        title: "Test Book",
        author: null,
        isbn: null,
        barcode: null,
        price: null,
        language: null,
        genres: [],
        publisher: null,
        bookshelf: null,
        numberOfCopies: null,
        numberOfSoldCopies: null,
      },
    ];

    await uploadBooks(mockClient as any as TRPCClient, books, genreMap, publisherMap);

    expect(mockClient.books.upsert.mutate).toHaveBeenCalledWith({
      title: "Test Book",
      author: null,
      isbn: null,
      barcode: null,
      price: null,
      language: null,
      genreIds: [],
      publisherId: null,
      stock: {
        bookshelf: null,
        numberOfCopies: 0,
        numberOfCopiesSold: 0,
      },
    });
  });
});
