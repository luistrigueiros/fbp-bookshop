import {
  sqliteTable,
  integer,
  text,
  real,
  primaryKey,
  uniqueIndex,
  index,
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
    mediaFolderId: text("media_folder_id").notNull().default(""),
  },
  (t) => ({
    isbnIdx: uniqueIndex("book_isbn_idx").on(t.isbn),
    uniqueBookIdx: uniqueIndex("book_unique_idx").on(t.title, t.author, t.isbn),
    mediaFolderIdIdx: uniqueIndex("book_media_folder_id_idx").on(t.mediaFolderId),
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

// Book Media table
export const bookMedia = sqliteTable(
  "book_media",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    bookId: integer("book_id")
      .notNull()
      .references(() => book.id, { onDelete: "cascade" }),
    mediaType: text("media_type", { length: 20 }).notNull(),
    mediaCategory: text("media_category", { length: 30 }).notNull(),
    r2Key: text("r2_key", { length: 255 }).notNull(),
    fileName: text("file_name", { length: 255 }).notNull(),
    fileSize: integer("file_size"),
    mimeType: text("mime_type", { length: 100 }),
    width: integer("width"),
    height: integer("height"),
    thumbnailKey: text("thumbnail_key", { length: 255 }),
    displayOrder: integer("display_order").default(0),
    isPrimary: integer("is_primary", { mode: "boolean" }).default(false),
    description: text("description"),
    uploadedAt: integer("uploaded_at", { mode: "timestamp" }).notNull(),
    duration: integer("duration"),
  },
  (t) => ({
    bookIdx: index("book_media_book_idx").on(t.bookId),
    r2KeyIdx: uniqueIndex("book_media_r2key_idx").on(t.r2Key),
    primaryIdx: index("book_media_primary_idx").on(t.bookId, t.isPrimary),
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
  media: many(bookMedia),
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

export const bookMediaRelations = relations(bookMedia, ({ one }) => ({
  book: one(book, { fields: [bookMedia.bookId], references: [book.id] }),
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
  errorMessage: text("error_message"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});
