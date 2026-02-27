import { eq, like } from "drizzle-orm";
import type { DB } from "../db";
import { publisher } from "../schema";
import type {
  NewPublisher,
  Publisher,
  PublisherWithBooks,
} from "../schema/types";

export class PublisherRepository {
  constructor(private db: DB) {}

  /**
   * Create a new publisher
   */
  async create(data: NewPublisher): Promise<Publisher> {
    const result = await this.db.insert(publisher).values(data).returning();
    return result[0]!;
  }

  /**
   * Get publisher by ID
   */
  async findById(id: number): Promise<Publisher | undefined> {
    const result = await this.db
      .select()
      .from(publisher)
      .where(eq(publisher.id, id));
    return result[0];
  }

  /**
   * Get publisher by ID with books
   */
  async findByIdWithBooks(id: number): Promise<PublisherWithBooks | undefined> {
    return this.db.query.publisher.findFirst({
      where: eq(publisher.id, id),
      with: {
        books: true,
      },
    });
  }

  /**
   * Get publisher by name
   */
  async findByName(name: string): Promise<Publisher | undefined> {
    const result = await this.db
      .select()
      .from(publisher)
      .where(eq(publisher.name, name));
    return result[0];
  }

  /**
   * Get all publishers
   */
  async findAll(): Promise<Publisher[]> {
    return this.db.select().from(publisher);
  }

  /**
   * Get all publishers with their books
   */
  async findAllWithBooks(): Promise<PublisherWithBooks[]> {
    return this.db.query.publisher.findMany({
      with: {
        books: true,
      },
    });
  }

  /**
   * Search publishers by name
   */
  async search(query: string): Promise<Publisher[]> {
    const searchPattern = `%${query}%`;
    return this.db
      .select()
      .from(publisher)
      .where(like(publisher.name, searchPattern));
  }

  /**
   * Update a publisher
   */
  async update(
    id: number,
    data: Partial<NewPublisher>,
  ): Promise<Publisher | undefined> {
    const result = await this.db
      .update(publisher)
      .set(data)
      .where(eq(publisher.id, id))
      .returning();
    return result[0];
  }

  /**
   * Delete a publisher
   */
  async delete(id: number): Promise<boolean> {
    const result = await this.db
      .delete(publisher)
      .where(eq(publisher.id, id))
      .returning();
    return result.length > 0;
  }

  /**
   * Count total publishers
   */
  async count(): Promise<number> {
    const result = await this.db.select().from(publisher);
    return result.length;
  }
}
