import type { DB } from "../db";
import type { Book, BookWithRelations, NewBook } from "../schema/types";
export declare class BookRepository {
  private db;
  constructor(db: DB);
  /**
   * Create a new book
   */
  create(data: NewBook & {
    genderIds?: number[];
  }): Promise<Book>;
  /**
   * Create multiple books in a single batch
   */
  createMany(data: (NewBook & {
    genderIds?: number[];
  })[]): Promise<Book[]>;
  /**
   * Get book by ID
   */
  findById(id: number): Promise<Book | undefined>;
  /**
   * Get a book by ID with relations (gender and publisher)
   */
  findByIdWithRelations(id: number): Promise<BookWithRelations | undefined>;
  /**
   * Get all books
   */
  findAll(): Promise<Book[]>;
  /**
   * Get all books with relations
   */
  findAllWithRelations(): Promise<BookWithRelations[]>;
  /**
   * Search books by title or author
   */
  search(query: string): Promise<Book[]>;
  /**
   * Find books by gender ID
   */
  findByGenderId(genderId: number): Promise<Book[]>;
  /**
   * Find books by publisher ID
   */
  findByPublisherId(publisherId: number): Promise<Book[]>;
  /**
   * Find books by ISBN
   */
  findByIsbn(isbn: string): Promise<Book | undefined>;
  /**
   * Find books by barcode
   */
  findByBarcode(barcode: string): Promise<Book | undefined>;
  /**
   * Update a book
   */
  update(id: number, data: Partial<NewBook> & {
    genderIds?: number[];
  }): Promise<Book | undefined>;
  /**
   * Delete a book
   */
  delete(id: number): Promise<boolean>;
  /**
   * Count total books
   */
  count(): Promise<number>;
}
