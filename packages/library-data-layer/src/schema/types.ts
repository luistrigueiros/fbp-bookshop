import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { book, genre, publisher, bookGenre, bookStock } from "./index";

// Select types (for data retrieved from DB)
export type Book = InferSelectModel<typeof book>;
export type Genre = InferSelectModel<typeof genre>;
export type Publisher = InferSelectModel<typeof publisher>;
export type BookStock = InferSelectModel<typeof bookStock>;

// Insert types (for data to be inserted into DB)
export type NewBook = InferInsertModel<typeof book>;
export type NewGenre = InferInsertModel<typeof genre>;
export type NewPublisher = InferInsertModel<typeof publisher>;
export type NewBookStock = InferInsertModel<typeof bookStock>;

// Extended types with relations
export type BookGenre = InferSelectModel<typeof bookGenre>;

export type BookWithRelations = Book & {
  bookGenres?: (BookGenre & { genre: Genre })[];
  publisher?: Publisher | null;
  stock?: BookStock | null;
};

export type GenreWithBooks = Genre & {
  bookGenres?: (BookGenre & { book: Book })[];
  books?: Book[];
};

export type PublisherWithBooks = Publisher & {
  books?: Book[];
};

// Upload Status types
export { uploadStatus } from "./index";
import { uploadStatus } from "./index";

export enum UploadStatus {
  UPLOADED = "UPLOADED",
  PROCESSING = "PROCESSING",
  PROCESSED_SUCCESSFULLY = "PROCESSED_SUCCESSFULLY",
  PROCESSED_FAILED = "PROCESSED_FAILED",
}

export type UploadStatusRecord = InferSelectModel<typeof uploadStatus>;
export type NewUploadStatus = InferInsertModel<typeof uploadStatus>;
