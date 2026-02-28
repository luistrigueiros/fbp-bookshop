# Library Data Layer

A data access layer for a Library book shop management system using Drizzle ORM and Cloudflare D1 database. Built with Bun.js for optimal performance as part of the FBP-Bookshop monorepo.

## Features

- 📚 Complete database schema for books, genres (genders), and publishers
- 🔄 Full CRUD operations with type-safe repositories
- 🔗 Relationship support (books with their genres and publishers)
- 🚀 Optimized for Cloudflare D1 and Workers
- 💪 Written in TypeScript with full type safety
- ⚡ Built with Bun.js for fast development

## Database Schema

### Tables

- **book**: Stores book information including title, author, ISBN, barcode, price, language
- **gender**: Book genres/categories (e.g., Fiction, Non-Fiction, Science)
- **publisher**: Publishing companies

### Relationships

- Books can have one gender (genre) - nullable relationship
- Books can have one publisher - nullable relationship
- Genders can have many books
- Publishers can have many books

## Installation

This package is part of a Bun monorepo.

### Prerequisites

- [Bun.js](https://bun.sh/) installed
- Cloudflare account with Wrangler CLI
- Cloudflare D1 database

### Setup

1. **Install dependencies from monorepo root:**

```bash
bun install
```

2. **Database Configuration:**

Ensure you have a `wrangler.toml` file in this directory (it should be pre-configured for the monorepo).

3. **Generate and run migrations:**

From the `packages/library-data-layer` directory:

```bash
# Generate migration files
bun run db:generate

# Apply migrations locally
bun run db:migrate:local
```

## Usage

### Getting Started

Import the initialization and repository functions in your Cloudflare Worker:

```typescript
import { initDB, validateDB, createRepositories } from "library-data-layer";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // 1. Initialize database connection
    const db = initDB(env.DB);

    // 2. Validate database schema and migrations
    const validation = await validateDB(db);
    if (!validation.success) {
      console.error(`Database validation failed: ${validation.error}`);
      return new Response("Database not correctly initialized", {
        status: 500,
      });
    }

    // 3. Create repositories and proceed
    const repos = createRepositories(db);
    // ...
  },
};
```

### Repository API Examples

#### Book Repository

```typescript
// Create a book
const newBook = await repos.books.create({
  title: "The Great Gatsby",
  author: "F. Scott Fitzgerald",
  isbn: "978-0743273565",
  barcode: "9780743273565",
  price: 15.99,
  language: "English",
  genderId: 1,
  publisherId: 1,
});

// Find book by ID with relations
const book = await repos.books.findByIdWithRelations(1);

// Search books
const searchResults = await repos.books.search("Gatsby");

// Find by ISBN
const bookByIsbn = await repos.books.findByIsbn("978-0743273565");

// Update book
await repos.books.update(1, { price: 12.99 });

// Delete book
await repos.books.delete(1);
```

#### Gender Repository

```typescript
// Create a genre
const newGender = await repos.genders.create({
  name: "Science Fiction",
});

// Get genre with all its books
const genreWithBooks = await repos.genders.findByIdWithBooks(1);

// Search genres
const genres = await repos.genders.search("Fiction");
```

#### Publisher Repository

```typescript
// Create a publisher
const newPublisher = await repos.publishers.create({
  name: "Penguin Random House",
});

// Get publisher with all its books
const publisherWithBooks = await repos.publishers.findByIdWithBooks(1);

// Find by name
const publisher = await repos.publishers.findByName("Penguin Random House");
```

## Development

### Available Scripts

Run these from the `packages/library-data-layer` directory:

- `bun run build` - Build the library and generate types
- `bun run typecheck` - Run TypeScript compiler checks
- `bun run db:generate` - Generate Drizzle migration files
- `bun run db:migrate:local` - Apply migrations to the local D1 instance
- `bun run db:studio` - Open Drizzle Studio for database management
- `bun test` - Run the test suite
- `bun run lint` - Run ESLint checks

### Project Structure (Internal)

```
library-data-layer/
├── src/
│   ├── schema/
│   │   ├── index.ts          # Database schema definitions
│   │   └── types.ts          # TypeScript types
│   ├── repositories/
│   │   ├── book.repository.ts
│   │   ├── gender.repository.ts
│   │   ├── publisher.repository.ts
│   │   └── index.ts
│   ├── db.ts                 # Database initialization
│   └── index.ts              # Main entry point
├── drizzle/                  # Generated migrations
├── drizzle.config.ts         # Drizzle configuration
├── wrangler.toml             # Cloudflare configuration
├── tsconfig.json
└── package.json
```

## Type Safety

All operations are fully typed. TypeScript will catch errors at compile time:

```typescript
// ✅ Type-safe
const book = await repos.books.create({
  title: "Book Title",
  author: "Author Name",
});

// ❌ TypeScript error - missing required field
const book = await repos.books.create({
  author: "Author Name",
});
```

## Advanced Usage

### Custom Queries

You can access the Drizzle database instance directly for custom queries:

```typescript
import { initDB } from "library-data-layer";
import { book, gender } from "library-data-layer/src/schema";
import { eq } from "drizzle-orm";

const db = initDB(env.DB);

// Custom join query
const booksWithGenres = await db
  .select({
    bookTitle: book.title,
    genreName: gender.name,
  })
  .from(book)
  .leftJoin(gender, eq(book.genderId, gender.id));
```

### Transactions

```typescript
// Perform multiple operations in a transaction
await db.transaction(async (tx) => {
  const newGender = await tx
    .insert(gender)
    .values({ name: "Mystery" })
    .returning();

  await tx.insert(book).values({
    title: "Mystery Book",
    genderId: newGender[0].id,
  });
});
```

## Notes

- **Gender vs Genre**: The schema uses "gender" as the table name, but it represents book genres/categories.
- **Price**: Stored as `REAL` in SQLite (floating point), suitable for currency values.
- **Auto-increment IDs**: Uses SQLite's `AUTOINCREMENT` for primary keys.

## License

MIT
