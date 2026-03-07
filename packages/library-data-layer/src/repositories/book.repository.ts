import { eq, like, or } from "drizzle-orm";
import type { DB } from "../db";
import { book } from "../schema";
import type { Book, BookWithRelations, NewBook } from "../schema/types";
import { layerLogger } from "../logging";

export class BookRepository {
  constructor(private db: DB) {}

  /**
   * Create a new book
   */
  async create(data: NewBook): Promise<Book> {
    layerLogger.debug("Creating new book: {title}", { title: data.title });
    const result = await this.db.insert(book).values(data).returning();
    const createdBook = result[0]!;
    layerLogger.info("Created book: {title} (ID: {id})", {
      title: createdBook.title,
      id: createdBook.id,
    });
    return createdBook;
  }

  /**
   * Create multiple books in a single batch
   */
  async createMany(data: NewBook[]): Promise<Book[]> {
    if (data.length === 0) return [];
    layerLogger.debug("Creating {count} new books", { count: data.length });
    const result = await this.db.insert(book).values(data).returning();
    layerLogger.info("Created {count} books", { count: result.length });
    return result;
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
        gender: true,
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
        gender: true,
        publisher: true,
      },
    });
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
    return this.db.select().from(book).where(eq(book.genderId, genderId));
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
  async update(id: number, data: Partial<NewBook>): Promise<Book | undefined> {
    layerLogger.debug("Updating book ID: {id}", { id });
    const result = await this.db
      .update(book)
      .set(data)
      .where(eq(book.id, id))
      .returning();
    const updatedBook = result[0];
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
