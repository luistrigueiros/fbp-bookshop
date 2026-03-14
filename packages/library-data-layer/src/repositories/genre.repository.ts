import { eq, like, sql } from "drizzle-orm";
import type { DB } from "../db";
import { genre, bookGenre } from "../schema";
import type {Book, Genre, GenreWithBooks, NewGenre, CategoryWithCount} from "../schema/types";
import { layerLogger } from "../logging";

export class GenreRepository {
  constructor(private db: DB) {}

  /**
   * Create a new genre
   */
  async create(data: NewGenre): Promise<Genre> {
    layerLogger.debug("Creating new genre: {name}", { name: data.name });
    const result = await this.db.insert(genre).values(data).returning();
    const createdGenre = result[0]!;
    layerLogger.info("Created genre: {name} (ID: {id})", {
      name: createdGenre.name,
      id: createdGenre.id,
    });
    return createdGenre;
  }

  /**
   * Create multiple genres in a single batch
   */
  async createMany(data: NewGenre[]): Promise<Genre[]> {
    if (data.length === 0) return [];
    layerLogger.debug("Creating {count} new genres", { count: data.length });
    const result = await this.db.insert(genre).values(data).returning();
    layerLogger.info("Created {count} genres", { count: result.length });
    return result;
  }

  /**
   * Get genre by ID
   */
  async findById(id: number): Promise<Genre | undefined> {
    const result = await this.db.select().from(genre).where(eq(genre.id, id));
    return result[0];
  }

  /**
   * Get genre by ID with books
   */
  async findByIdWithBooks(id: number): Promise<GenreWithBooks | undefined> {
    const result = await this.db.query.genre.findFirst({
      where: eq(genre.id, id),
      with: {
        bookGenres: {
          with: {
            book: true,
          },
        },
      },
    });

    if (!result) return undefined;

    return {
      ...result,
      books: result.bookGenres?.map((bg) => bg.book).filter(Boolean) as Book[],
    };
  }

  /**
   * Get genre by name
   */
  async findByName(name: string): Promise<Genre | undefined> {
    const result = await this.db
      .select()
      .from(genre)
      .where(eq(genre.name, name));
    return result[0];
  }

  /**
   * Get all genres
   */
  async findAll(): Promise<Genre[]> {
    return this.db.select().from(genre);
  }

  /**
   * Get all genres with their books
   */
  async findAllWithBooks(): Promise<GenreWithBooks[]> {
    const results = await this.db.query.genre.findMany({
      with: {
        bookGenres: {
          with: {
            book: true,
          },
        },
      },
    });

    return results.map((result) => ({
      ...result,
      books: result.bookGenres?.map((bg) => bg.book).filter(Boolean) as Book[],
    }));
  }

  /**
   * Search genres by name
   */
  async search(query: string): Promise<Genre[]> {
    const searchPattern = `%${query}%`;
    return this.db
      .select()
      .from(genre)
      .where(like(genre.name, searchPattern));
  }

  /**
   * Update a genre
   */
  async update(
    id: number,
    data: Partial<NewGenre>,
  ): Promise<Genre | undefined> {
    layerLogger.debug("Updating genre ID: {id}", { id });
    const result = await this.db
      .update(genre)
      .set(data)
      .where(eq(genre.id, id))
      .returning();
    const updatedGenre = result[0];
    if (updatedGenre) {
      layerLogger.info("Updated genre ID: {id}", { id });
    }
    return updatedGenre;
  }

  /**
   * Delete a genre
   */
  async delete(id: number): Promise<boolean> {
    const result = await this.db
      .delete(genre)
      .where(eq(genre.id, id))
      .returning();
    return result.length > 0;
  }

  /**
   * Count total genres
   */
  async count(): Promise<number> {
    const result = await this.db.select().from(genre);
    return result.length;
  }

  /**
   * Get genres with book counts, paginated and filtered
   */
  async findWithBookCounts(params: {
    limit: number;
    offset: number;
    name?: string;
  }): Promise<{ items: CategoryWithCount[]; total: number }> {
    const { limit, offset, name } = params;

    const whereClause = name ? like(genre.name, `%${name}%`) : undefined;

    const countsQuery = this.db
      .select({
        id: genre.id,
        name: genre.name,
        bookCount: sql<number>`count(${bookGenre.bookId})`.as("bookCount"),
      })
      .from(genre)
      .leftJoin(bookGenre, eq(genre.id, bookGenre.genreId))
      .where(whereClause)
      .groupBy(genre.id)
      .limit(limit)
      .offset(offset);

    const totalQuery = this.db
      .select({
        count: sql<number>`count(distinct ${genre.id})`,
      })
      .from(genre)
      .where(whereClause);

    const [items, totalResult] = await Promise.all([
      countsQuery,
      totalQuery,
    ]);

    return {
      items: items.map(item => ({
        ...item,
        bookCount: Number(item.bookCount)
      })),
      total: Number(totalResult[0]?.count ?? 0),
    };
  }
}
