import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { book, gender, publisher } from "./index";
export type Book = InferSelectModel<typeof book>;
export type Gender = InferSelectModel<typeof gender>;
export type Publisher = InferSelectModel<typeof publisher>;
export type NewBook = InferInsertModel<typeof book>;
export type NewGender = InferInsertModel<typeof gender>;
export type NewPublisher = InferInsertModel<typeof publisher>;
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
