import { and, asc, eq } from "drizzle-orm";
import type { DB } from "../db";
import { bookMedia } from "../schema";
import type { BookMedia, NewBookMedia } from "../schema/types";
import { layerLogger } from "../logging";

export class BookMediaRepository {
  constructor(private db: DB) {}

  /**
   * Create a new book media record
   */
  async create(data: NewBookMedia): Promise<BookMedia> {
    layerLogger.debug(
      "Creating new book media for book ID: {bookId}, category: {category}",
      { bookId: data.bookId, category: data.mediaCategory },
    );
    const result = await this.db.insert(bookMedia).values(data).returning();
    const created = result[0]!;
    layerLogger.info("Created book media ID: {id} for book ID: {bookId}", {
      id: created.id,
      bookId: created.bookId,
    });
    return created;
  }

  /**
   * Find all media for a book, ordered by displayOrder ASC
   */
  async findByBookId(bookId: number): Promise<BookMedia[]> {
    return this.db
      .select()
      .from(bookMedia)
      .where(eq(bookMedia.bookId, bookId))
      .orderBy(asc(bookMedia.displayOrder));
  }

  /**
   * Find media for a book filtered by category, ordered by displayOrder ASC
   */
  async findByBookIdAndCategory(
    bookId: number,
    category: string,
  ): Promise<BookMedia[]> {
    return this.db
      .select()
      .from(bookMedia)
      .where(
        and(
          eq(bookMedia.bookId, bookId),
          eq(bookMedia.mediaCategory, category),
        ),
      )
      .orderBy(asc(bookMedia.displayOrder));
  }

  /**
   * Find a single media record by ID
   */
  async findById(id: number): Promise<BookMedia | undefined> {
    const result = await this.db
      .select()
      .from(bookMedia)
      .where(eq(bookMedia.id, id));
    return result[0];
  }

  /**
   * Delete a media record by ID
   */
  async delete(id: number): Promise<boolean> {
    layerLogger.debug("Deleting book media ID: {id}", { id });
    const result = await this.db
      .delete(bookMedia)
      .where(eq(bookMedia.id, id))
      .returning();
    const deleted = result.length > 0;
    if (deleted) {
      layerLogger.info("Deleted book media ID: {id}", { id });
    }
    return deleted;
  }

  /**
   * Update the display order and isPrimary flag for a media record
   */
  async updateOrder(
    id: number,
    displayOrder: number,
    isPrimary: boolean,
  ): Promise<BookMedia | undefined> {
    layerLogger.debug(
      "Updating order for book media ID: {id}, displayOrder: {displayOrder}, isPrimary: {isPrimary}",
      { id, displayOrder, isPrimary },
    );
    const result = await this.db
      .update(bookMedia)
      .set({ displayOrder, isPrimary })
      .where(eq(bookMedia.id, id))
      .returning();
    const updated = result[0];
    if (updated) {
      layerLogger.info("Updated order for book media ID: {id}", { id });
    }
    return updated;
  }

  /**
   * Clear isPrimary for all records matching bookId + category
   */
  async clearPrimary(bookId: number, category: string): Promise<void> {
    layerLogger.debug(
      "Clearing primary flag for book ID: {bookId}, category: {category}",
      { bookId, category },
    );
    await this.db
      .update(bookMedia)
      .set({ isPrimary: false })
      .where(
        and(
          eq(bookMedia.bookId, bookId),
          eq(bookMedia.mediaCategory, category),
        ),
      );
  }
}
