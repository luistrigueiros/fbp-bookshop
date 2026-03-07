import type { DB } from "../db";
import type {
  NewPublisher,
  Publisher,
  PublisherWithBooks,
} from "../schema/types";
export declare class PublisherRepository {
  private db;
  constructor(db: DB);
  /**
   * Create a new publisher
   */
  create(data: NewPublisher): Promise<Publisher>;
  /**
   * Get publisher by ID
   */
  findById(id: number): Promise<Publisher | undefined>;
  /**
   * Get publisher by ID with books
   */
  findByIdWithBooks(id: number): Promise<PublisherWithBooks | undefined>;
  /**
   * Get publisher by name
   */
  findByName(name: string): Promise<Publisher | undefined>;
  /**
   * Get all publishers
   */
  findAll(): Promise<Publisher[]>;
  /**
   * Get all publishers with their books
   */
  findAllWithBooks(): Promise<PublisherWithBooks[]>;
  /**
   * Search publishers by name
   */
  search(query: string): Promise<Publisher[]>;
  /**
   * Update a publisher
   */
  update(
    id: number,
    data: Partial<NewPublisher>,
  ): Promise<Publisher | undefined>;
  /**
   * Delete a publisher
   */
  delete(id: number): Promise<boolean>;
  /**
   * Count total publishers
   */
  count(): Promise<number>;
}
