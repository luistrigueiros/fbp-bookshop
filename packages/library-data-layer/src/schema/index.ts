import { sqliteTable, integer, text, real } from "drizzle-orm/sqlite-core";
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
  genderId: integer("gender_id").references(getGenderId, {
    onDelete: "set null",
  }),
  publisherId: integer("publisher_id").references(getPublisherId, {
    onDelete: "set null",
  }),
});

// Define relations for better TypeScript support and joins
export const bookRelations = relations(book, ({ one }) => ({
  gender: one(gender, {
    fields: [book.genderId],
    references: [gender.id],
  }),
  publisher: one(publisher, {
    fields: [book.publisherId],
    references: [publisher.id],
  }),
}));

export const genderRelations = relations(gender, ({ many }) => ({
  books: many(book),
}));

export const publisherRelations = relations(publisher, ({ many }) => ({
  books: many(book),
}));

// Upload Status table
export const uploadStatus = sqliteTable("upload_status", {
  key: text("key").primaryKey(), // R2 key
  status: text("status", { enum: ["UPLOADED", "PROCESSING", "PROCESSED_SUCCESSFULLY", "PROCESSED_FAILED"] }).notNull(),
  filename: text("filename"),
  booksCount: integer("books_count").default(0),
  processedCount: integer("processed_count").default(0),
  error: text("error"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});
