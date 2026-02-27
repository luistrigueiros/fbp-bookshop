import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { book, gender, publisher } from "./index";

// Select types (for data retrieved from DB)
export type Book = InferSelectModel<typeof book>;
export type Gender = InferSelectModel<typeof gender>;
export type Publisher = InferSelectModel<typeof publisher>;

// Insert types (for data to be inserted into DB)
export type NewBook = InferInsertModel<typeof book>;
export type NewGender = InferInsertModel<typeof gender>;
export type NewPublisher = InferInsertModel<typeof publisher>;

// Extended types with relations
export type BookWithRelations = Book & {
  gender?: Gender | null;
  publisher?: Publisher | null;
};

export type GenderWithBooks = Gender & {
  books?: Book[];
};

export type PublisherWithBooks = Publisher & {
  books?: Book[];
};
