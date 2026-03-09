import { eq, like, or, and, sql, In } from "drizzle-orm";
import type { DB } from "../db";
import { book, bookGender } from "../schema";
import type { Book, BookWithRelations, NewBook } from "../schema/types";
import { layerLogger } from "../logging";

export class BookRepository {
  constructor(private db: DB) {}

  /**
   * Create a new book
   */
  async create(data: NewBook & { genderIds?: number[] }): Promise<Book> {
    layerLogger.debug("Creating new book: {title}", { title: data.title });
    const { genderIds, ...bookData } = data;
    const result = await this.db.insert(book).values(bookData).returning();
    const createdBook = result[0]!;

    if (genderIds && genderIds.length > 0) {
      const bookGenders = genderIds.map((genderId) => ({
        bookId: createdBook.id,
        genderId,
      }));
      await this.db.insert(bookGender).values(bookGenders);
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
    data: (NewBook & { genderIds?: number[] })[],
  ): Promise<Book[]> {
    if (data.length === 0) return [];
    layerLogger.debug("Creating {count} new books", { count: data.length });

    const booksToInsert = data.map(({ genderIds, ...bookData }) => bookData);
    const createdBooks = await this.db.insert(book).values(booksToInsert).returning();

    const bookGendersToInsert: { bookId: number; genderId: number }[] = [];
    data.forEach((item, index) => {
      if (item.genderIds && item.genderIds.length > 0) {
        const bookId = createdBooks[index]!.id;
        item.genderIds.forEach((genderId) => {
          bookGendersToInsert.push({ bookId, genderId });
        });
      }
    });

    if (bookGendersToInsert.length > 0) {
      await this.db.insert(bookGender).values(bookGendersToInsert);
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
   * Get a book by ID with relations (gender and publisher)
   */
  async findByIdWithRelations(
    id: number,
  ): Promise<BookWithRelations | undefined> {
    return this.db.query.book.findFirst({
      where: eq(book.id, id),
      with: {
        bookGenders: {
          with: {
            gender: true,
          },
        },
        publisher: true,
      },
    });
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
        bookGenders: {
          with: {
            gender: true,
          },
        },
        publisher: true,
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
    genderId?: number;
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

    const whereClause = filters.length > 0 ? and(...filters) : undefined;

    // If genderId is provided, we first find the bookIds associated with that gender
    let bookIdsByGender: number[] | undefined;
    if (params.genderId !== undefined) {
      const bookGendersResults = await this.db
        .select({ bookId: bookGender.bookId })
        .from(bookGender)
        .where(eq(bookGender.genderId, params.genderId));
      bookIdsByGender = bookGendersResults.map((bg) => bg.bookId);
      
      // If no books found for this gender, return empty result
      if (bookIdsByGender.length === 0) {
        return { data: [], total: 0 };
      }
      
      filters.push(sql`${book.id} IN (${bookIdsByGender.join(",")})`);
    }

    const finalWhereClause = filters.length > 0 ? and(...filters) : undefined;

    // Get paginated data
    const query = this.db.query.book.findMany({
      where: finalWhereClause,
      with: {
        bookGenders: {
          with: {
            gender: true,
          },
        },
        publisher: true,
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
   * Find books by gender ID
   */
  async findByGenderId(genderId: number): Promise<Book[]> {
    const bookIds = await this.db
      .select({ bookId: bookGender.bookId })
      .from(bookGender)
      .where(eq(bookGender.genderId, genderId));
    
    if (bookIds.length === 0) return [];
    
    return this.db
      .select()
      .from(book)
      .where(sql`${book.id} IN (${bookIds.map(b => b.bookId).join(",")})`);
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
    data: Partial<NewBook> & { genderIds?: number[] },
  ): Promise<Book | undefined> {
    layerLogger.debug("Updating book ID: {id}", { id });
    const { genderIds, ...bookData } = data;
    
    const result = await this.db
      .update(book)
      .set(bookData)
      .where(eq(book.id, id))
      .returning();
    const updatedBook = result[0];
    
    if (updatedBook && genderIds !== undefined) {
      // Delete existing associations
      await this.db.delete(bookGender).where(eq(bookGender.bookId, id));
      
      // Add new associations
      if (genderIds.length > 0) {
        const bookGenders = genderIds.map((genderId) => ({
          bookId: id,
          genderId,
        }));
        await this.db.insert(bookGender).values(bookGenders);
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
   * Count total books
   */
  async count(): Promise<number> {
    const result = await this.db.select().from(book);
    return result.length;
  }
}
