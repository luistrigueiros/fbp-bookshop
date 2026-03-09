import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { book, gender, publisher, bookGender } from "./index";

// Select types (for data retrieved from DB)
export type Book = InferSelectModel<typeof book>;
export type Gender = InferSelectModel<typeof gender>;
export type Publisher = InferSelectModel<typeof publisher>;

// Insert types (for data to be inserted into DB)
export type NewBook = InferInsertModel<typeof book>;
export type NewGender = InferInsertModel<typeof gender>;
export type NewPublisher = InferInsertModel<typeof publisher>;

// Extended types with relations
export type BookGender = InferSelectModel<typeof bookGender>;

export type BookWithRelations = Book & {
  bookGenders?: (BookGender & { gender: Gender })[];
  publisher?: Publisher | null;
};

export type GenderWithBooks = Gender & {
  bookGenders?: (BookGender & { book: Book })[];
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
