// Database initialization
export {
  initDB,
  validateDB,
  runMigrations,
  splitMigrationStatements,
  type DB,
} from "./db";

// Schema exports
export * from "./schema";
export * from "./schema/types";

// Repository exports
export * from "./repositories";

// Logging exports
export * from "./logging";

// Utility function to create all repositories
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
export function createRepositories(db: DB): LibraryRepositories {
  return {
    books: new BookRepository(db),
    genders: new GenderRepository(db),
    publishers: new PublisherRepository(db),
  };
}
