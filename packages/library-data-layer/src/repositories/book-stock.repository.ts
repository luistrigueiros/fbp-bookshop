import { eq } from "drizzle-orm";
import type { DB } from "../db";
import { bookStock } from "../schema";
import type { BookStock, NewBookStock } from "../schema/types";
import { layerLogger } from "../logging";

export class BookStockRepository {
  constructor(private db: DB) {}

  /**
   * Create a new book stock record
   */
  async create(data: NewBookStock): Promise<BookStock> {
    layerLogger.debug("Creating new book stock for book ID: {bookId}", {
      bookId: data.bookId,
    });
    const result = await this.db.insert(bookStock).values(data).returning();
    const createdStock = result[0]!;
    layerLogger.info("Created book stock for book ID: {bookId} (ID: {id})", {
      bookId: createdStock.bookId,
      id: createdStock.id,
    });
    return createdStock;
  }

  /**
   * Get book stock by ID
   */
  async findById(id: number): Promise<BookStock | undefined> {
    const result = await this.db
      .select()
      .from(bookStock)
      .where(eq(bookStock.id, id));
    return result[0];
  }

  /**
   * Get book stock by book ID
   */
  async findByBookId(bookId: number): Promise<BookStock | undefined> {
    const result = await this.db
      .select()
      .from(bookStock)
      .where(eq(bookStock.bookId, bookId));
    return result[0];
  }

  /**
   * Update a book stock record
   */
  async update(
    id: number,
    data: Partial<NewBookStock>,
  ): Promise<BookStock | undefined> {
    layerLogger.debug("Updating book stock ID: {id}", { id });
    const result = await this.db
      .update(bookStock)
      .set(data)
      .where(eq(bookStock.id, id))
      .returning();
    const updatedStock = result[0];
    if (updatedStock) {
      layerLogger.info("Updated book stock ID: {id}", { id });
    }
    return updatedStock;
  }

  /**
   * Update book stock by book ID
   */
  async updateByBookId(
    bookId: number,
    data: Partial<NewBookStock>,
  ): Promise<BookStock | undefined> {
    layerLogger.debug("Updating book stock for book ID: {bookId}", { bookId });
    const result = await this.db
      .update(bookStock)
      .set(data)
      .where(eq(bookStock.bookId, bookId))
      .returning();
    const updatedStock = result[0];
    if (updatedStock) {
      layerLogger.info("Updated book stock for book ID: {bookId}", { bookId });
    }
    return updatedStock;
  }

  /**
   * Delete a book stock record
   */
  async delete(id: number): Promise<boolean> {
    const result = await this.db
      .delete(bookStock)
      .where(eq(bookStock.id, id))
      .returning();
    return result.length > 0;
  }

  /**
   * Delete book stock by book ID
   */
  async deleteByBookId(bookId: number): Promise<boolean> {
    const result = await this.db
      .delete(bookStock)
      .where(eq(bookStock.bookId, bookId))
      .returning();
    return result.length > 0;
  }

  /**
   * Count total book stock records
   */
  async count(): Promise<number> {
    const result = await this.db.select().from(bookStock);
    return result.length;
  }
}
