import { eq, like, or, and, sql, inArray, isNull } from "drizzle-orm";
import type { DB } from "../db";
import { book, bookGenre, bookStock } from "../schema";
import type { Book, BookWithRelations, NewBook, NewBookStock } from "../schema/types";
import { layerLogger } from "../logging";

export class BookRepository {
  constructor(private db: DB) {}

  /**
   * Create a new book
   */
  async create(
    data: NewBook & { genreIds?: number[]; stock?: Partial<NewBookStock> },
  ): Promise<Book> {
    layerLogger.debug("Creating new book: {title}", { title: data.title });
    const { genreIds, stock, ...bookData } = data;
    const result = await this.db.insert(book).values(bookData).returning();
    const createdBook = result[0]!;

    if (genreIds && genreIds.length > 0) {
      const bookGenres = genreIds.map((genreId) => ({
        bookId: createdBook.id,
        genreId,
      }));
      await this.db.insert(bookGenre).values(bookGenres);
    }

    if (stock) {
      await this.db.insert(bookStock).values({
        ...stock,
        bookId: createdBook.id,
      });
    }

    layerLogger.info("Created book: {title} (ID: {id})", {
      title: createdBook.title,
      id: createdBook.id,
    });
    return createdBook;
  }

  /**
   * Create multiple books in a single batch
   */
  async createMany(
    data: (NewBook & { genreIds?: number[] })[],
  ): Promise<Book[]> {
    if (data.length === 0) return [];
    layerLogger.debug("Creating {count} new books", { count: data.length });

    const booksToInsert = data.map(({ genreIds, ...bookData }) => bookData);
    const createdBooks = await this.db
      .insert(book)
      .values(booksToInsert)
      .returning();

    const bookGenresToInsert: { bookId: number; genreId: number }[] = [];
    data.forEach((item, index) => {
      if (item.genreIds && item.genreIds.length > 0) {
        const bookId = createdBooks[index]!.id;
        item.genreIds.forEach((genreId) => {
          bookGenresToInsert.push({ bookId, genreId });
        });
      }
    });

    if (bookGenresToInsert.length > 0) {
      await this.db.insert(bookGenre).values(bookGenresToInsert);
    }

    layerLogger.info("Created {count} books", { count: createdBooks.length });
    return createdBooks;
  }

  /**
   * Get book by ID
   */
  async findById(id: number): Promise<Book | undefined> {
    const result = await this.db.select().from(book).where(eq(book.id, id));
    return result[0];
  }

  /**
   * Get a book by ID with relations (genre and publisher)
   */
  async findByIdWithRelations(
    id: number,
  ): Promise<BookWithRelations | undefined> {
    const bookData = await this.db.query.book.findFirst({
      where: eq(book.id, id),
      with: {
        bookGenres: {
          with: {
            genre: true,
          },
        },
        publisher: true,
      },
    });

    if (!bookData) return undefined;

    const stockData = await this.db
      .select()
      .from(bookStock)
      .where(eq(bookStock.bookId, id));

    return {
      ...bookData,
      stock: stockData[0] || null,
    };
  }

  /**
   * Get all books
   */
  async findAll(): Promise<Book[]> {
    return this.db.select().from(book);
  }

  /**
   * Get all books with relations
   */
  async findAllWithRelations(): Promise<BookWithRelations[]> {
    return this.db.query.book.findMany({
      with: {
        bookGenres: {
          with: {
            genre: true,
          },
        },
        publisher: true,
        stock: true,
      },
    });
  }

  /**
   * Search books with filters and pagination
   */
  async findWithFilters(params: {
    limit?: number;
    offset?: number;
    title?: string;
    author?: string;
    publisherId?: number;
    genreId?: number;
    language?: string;
  }): Promise<{ data: BookWithRelations[]; total: number }> {
    const filters = [];

    if (params.title) {
      filters.push(like(book.title, `%${params.title}%`));
    }
    if (params.author) {
      filters.push(like(book.author, `%${params.author}%`));
    }
    if (params.publisherId !== undefined) {
      filters.push(eq(book.publisherId, params.publisherId));
    }
    if (params.language !== undefined) {
      filters.push(eq(book.language, params.language));
    }

    const whereClause = filters.length > 0 ? and(...filters) : undefined;

    // If genreId is provided, we first find the bookIds associated with that genre
    let bookIdsByGenre: number[] | undefined;
    if (params.genreId !== undefined) {
      const bookGenresResults = await this.db
        .select({ bookId: bookGenre.bookId })
        .from(bookGenre)
        .where(eq(bookGenre.genreId, params.genreId));
      bookIdsByGenre = bookGenresResults.map((bg) => bg.bookId);

      // If no books found for this genre, return empty result
      if (bookIdsByGenre.length === 0) {
        return { data: [], total: 0 };
      }

      filters.push(inArray(book.id, bookIdsByGenre));
    }

    const finalWhereClause = filters.length > 0 ? and(...filters) : undefined;

    // Get paginated data
    const query = this.db.query.book.findMany({
      where: finalWhereClause,
      with: {
        bookGenres: {
          with: {
            genre: true,
          },
        },
        publisher: true,
        stock: true,
      },
      limit: params.limit,
      offset: params.offset,
    });

    // Get total count for these filters
    const countQuery = this.db
      .select({ count: sql<number>`count(*)` })
      .from(book)
      .where(finalWhereClause);

    const [data, countResult] = await Promise.all([query, countQuery]);

    return {
      data,
      total: countResult[0]?.count || 0,
    };
  }

  /**
   * Search books by title or author
   */
  async search(query: string): Promise<Book[]> {
    const searchPattern = `%${query}%`;
    return this.db
      .select()
      .from(book)
      .where(
        or(like(book.title, searchPattern), like(book.author, searchPattern)),
      );
  }

  /**
   * Find books by genre ID
   */
  async findByGenreId(genreId: number): Promise<Book[]> {
    const bookIds = await this.db
      .select({ bookId: bookGenre.bookId })
      .from(bookGenre)
      .where(eq(bookGenre.genreId, genreId));

    if (bookIds.length === 0) return [];

    return this.db
      .select()
      .from(book)
      .where(
        inArray(
          book.id,
          bookIds.map((b) => b.bookId),
        ),
      );
  }

  /**
   * Find books by publisher ID
   */
  async findByPublisherId(publisherId: number): Promise<Book[]> {
    return this.db.select().from(book).where(eq(book.publisherId, publisherId));
  }

  /**
   * Find books by ISBN
   */
  async findByIsbn(isbn: string): Promise<Book | undefined> {
    const result = await this.db.select().from(book).where(eq(book.isbn, isbn));
    return result[0];
  }

  /**
   * Find book by title, author and ISBN
   */
  async findByUniqueCriteria(
    title: string,
    author: string | null,
    isbn: string | null,
  ): Promise<Book | undefined> {
    // 1. Try finding by ISBN first if it exists, as it's the most unique identifier
    if (isbn) {
      const byIsbn = await this.findByIsbn(isbn);
      if (byIsbn) return byIsbn;
    }

    // 2. Fallback to title + author + isbn combination
    const conditions = [eq(book.title, title)];
    if (author) {
      conditions.push(eq(book.author, author));
    } else {
      conditions.push(isNull(book.author));
    }

    if (isbn) {
      conditions.push(eq(book.isbn, isbn));
    } else {
      conditions.push(isNull(book.isbn));
    }

    const result = await this.db
      .select()
      .from(book)
      .where(and(...conditions));
    return result[0];
  }

  /**
   * Find books by barcode
   */
  async findByBarcode(barcode: string): Promise<Book | undefined> {
    const result = await this.db
      .select()
      .from(book)
      .where(eq(book.barcode, barcode));
    return result[0];
  }

  /**
   * Update a book
   */
  async update(
    id: number,
    data: Partial<NewBook> & {
      genreIds?: number[];
      stock?: Partial<NewBookStock>;
    },
  ): Promise<Book | undefined> {
    layerLogger.debug("Updating book ID: {id}", { id });
    const { genreIds, stock, ...bookData } = data;

    const result = await this.db
      .update(book)
      .set(bookData)
      .where(eq(book.id, id))
      .returning();
    const updatedBook = result[0];

    if (updatedBook && genreIds !== undefined) {
      // Delete existing associations
      await this.db.delete(bookGenre).where(eq(bookGenre.bookId, id));

      // Add new associations
      if (genreIds.length > 0) {
        const bookGenres = genreIds.map((genreId) => ({
          bookId: id,
          genreId,
        }));
        await this.db.insert(bookGenre).values(bookGenres);
      }
    }

    if (updatedBook && stock !== undefined) {
      const existingStock = await this.db
        .select()
        .from(bookStock)
        .where(eq(bookStock.bookId, id));

      if (existingStock.length > 0) {
        await this.db
          .update(bookStock)
          .set(stock)
          .where(eq(bookStock.bookId, id));
      } else {
        await this.db.insert(bookStock).values({
          ...stock,
          bookId: id,
        });
      }
    }

    if (updatedBook) {
      layerLogger.info("Updated book ID: {id}", { id });
    }
    return updatedBook;
  }

  /**
   * Delete a book
   */
  async delete(id: number): Promise<boolean> {
    const result = await this.db
      .delete(book)
      .where(eq(book.id, id))
      .returning();
    return result.length > 0;
  }

  /**
   * Get all unique languages from the book table
   */
  async getLanguages(): Promise<string[]> {
    const result = await this.db
      .select({ language: book.language })
      .from(book)
      .groupBy(book.language);
    
    return result
      .map(r => r.language)
      .filter((l): l is string => l !== null && l !== "");
  }

  /**
   * Count total books
   */
  async count(): Promise<number> {
    const result = await this.db.select().from(book);
    return result.length;
  }
}
