export { initDB, validateDB, type DB } from "./db";
export * from "./schema";
export * from "./schema/types";
export * from "./repositories";
import type { DB } from "./db";
import {
  BookRepository,
  GenderRepository,
  PublisherRepository,
} from "./repositories";
export interface LibraryRepositories {
  books: BookRepository;
  genders: GenderRepository;
  publishers: PublisherRepository;
}
/**
 * Create all repository instances for the library database
 * @param db - Initialized Drizzle database instance
 * @returns Object containing all repository instances
 */
export declare function createRepositories(db: DB): LibraryRepositories;
