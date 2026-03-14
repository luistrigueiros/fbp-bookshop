import {
  sqliteTable,
  integer,
  text,
  real,
  primaryKey,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// Genre table (genre/category)
export const genre = sqliteTable("genre", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name", { length: 100 }).notNull().unique(),
});

// Publisher table
export const publisher = sqliteTable("publisher", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name", { length: 200 }).notNull().unique(),
});

export function getGenreId() {
  return genre.id;
}
export function getPublisherId() {
  return publisher.id;
}

// Book table
export const book = sqliteTable(
  "book",
  {
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
  },
  (t) => ({
    isbnIdx: uniqueIndex("book_isbn_idx").on(t.isbn),
    uniqueBookIdx: uniqueIndex("book_unique_idx").on(t.title, t.author, t.isbn),
  }),
);

// Book Stock table
export const bookStock = sqliteTable("book_stock", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  bookId: integer("book_id")
    .notNull()
    .unique()
    .references(() => book.id, { onDelete: "cascade" }),
  bookshelf: text("bookshelf", { length: 100 }),
  numberOfCopies: integer("number_of_copies").default(0).notNull(),
  numberOfCopiesSold: integer("number_of_copies_sold").default(0).notNull(),
});

export const bookGenre = sqliteTable(
  "book_genre",
  {
    bookId: integer("book_id")
      .notNull()
      .references(() => book.id, { onDelete: "cascade" }),
    genreId: integer("genre_id")
      .notNull()
      .references(getGenreId, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.bookId, t.genreId] }),
  }),
);

// Define relations for better TypeScript support and joins
export const bookRelations = relations(book, ({ one, many }) => ({
  publisher: one(publisher, {
    fields: [book.publisherId],
    references: [publisher.id],
  }),
  bookGenres: many(bookGenre),
  stock: one(bookStock),
}));

export const bookStockRelations = relations(bookStock, ({ one }) => ({
  book: one(book, {
    fields: [bookStock.bookId],
    references: [book.id],
  }),
}));

export const genreRelations = relations(genre, ({ many }) => ({
  bookGenres: many(bookGenre),
}));

export const publisherRelations = relations(publisher, ({ many }) => ({
  books: many(book),
}));

export const bookGenreRelations = relations(bookGenre, ({ one }) => ({
  book: one(book, {
    fields: [bookGenre.bookId],
    references: [book.id],
  }),
  genre: one(genre, {
    fields: [bookGenre.genreId],
    references: [genre.id],
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

// Export Job table
export const exportJob = sqliteTable("export_job", {
  id: text("id").primaryKey(), // UUID
  status: text("status", {
    enum: ["pending", "processing", "completed", "failed"],
  })
    .notNull()
    .default("pending"),
  progress: integer("progress").default(0),
  url: text("url"),
  error: text("error"),
  errorMessage: text("error_message"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});
