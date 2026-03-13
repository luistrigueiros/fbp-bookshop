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
  BookStockRepository,
  GenreRepository,
  PublisherRepository,
  UploadStatusRepository,
  ExportJobRepository,
} from "./repositories";

export interface LibraryRepositories {
  books: BookRepository;
  bookStock: BookStockRepository;
  genres: GenreRepository;
  publishers: PublisherRepository;
  uploads: UploadStatusRepository;
  exports: ExportJobRepository;
}

/**
 * Create all repository instances for the library database
 * @param db - Initialized Drizzle database instance
 * @returns Object containing all repository instances
 */
export function createRepositories(db: DB): LibraryRepositories {
  return {
    books: new BookRepository(db),
    bookStock: new BookStockRepository(db),
    genres: new GenreRepository(db),
    publishers: new PublisherRepository(db),
    uploads: new UploadStatusRepository(db),
    exports: new ExportJobRepository(db),
  };
}
