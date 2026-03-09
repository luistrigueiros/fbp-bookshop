import {
  sqliteTable,
  integer,
  text,
  real,
  primaryKey,
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// Gender table (genre/category)
export const gender = sqliteTable("gender", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name", { length: 100 }).notNull().unique(),
});

// Publisher table
export const publisher = sqliteTable("publisher", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name", { length: 200 }).notNull().unique(),
});

export function getGenderId() {
  return gender.id;
}
export function getPublisherId() {
  return publisher.id;
}

// Book table
export const book = sqliteTable("book", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title", { length: 500 }).notNull(),
  author: text("author", { length: 300 }),
  isbn: text("isbn", { length: 20 }),
  barcode: text("barcode", { length: 50 }),
  price: real("price"), // SQLite uses REAL for decimal numbers
  language: text("language", { length: 50 }),
  publisherId: integer("publisher_id").references(getPublisherId, {
    onDelete: "set null",
  }),
});

export const bookGender = sqliteTable(
  "book_gender",
  {
    bookId: integer("book_id")
      .notNull()
      .references(() => book.id, { onDelete: "cascade" }),
    genderId: integer("gender_id")
      .notNull()
      .references(getGenderId, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.bookId, t.genderId] }),
  }),
);

// Define relations for better TypeScript support and joins
export const bookRelations = relations(book, ({ one, many }) => ({
  publisher: one(publisher, {
    fields: [book.publisherId],
    references: [publisher.id],
  }),
  bookGenders: many(bookGender),
}));

export const genderRelations = relations(gender, ({ many }) => ({
  bookGenders: many(bookGender),
}));

export const publisherRelations = relations(publisher, ({ many }) => ({
  books: many(book),
}));

export const bookGenderRelations = relations(bookGender, ({ one }) => ({
  book: one(book, {
    fields: [bookGender.bookId],
    references: [book.id],
  }),
  gender: one(gender, {
    fields: [bookGender.genderId],
    references: [gender.id],
  }),
}));

// Upload Status table
export const uploadStatus = sqliteTable("upload_status", {
  key: text("key").primaryKey(), // R2 key
  status: text("status", {
    enum: [
      "UPLOADED",
      "PROCESSING",
      "PROCESSED_SUCCESSFULLY",
      "PROCESSED_FAILED",
    ],
  }).notNull(),
  filename: text("filename"),
  booksCount: integer("books_count").default(0),
  processedCount: integer("processed_count").default(0),
  error: text("error"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});
