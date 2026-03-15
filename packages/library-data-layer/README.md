# Library Data Layer

A data access layer for a Library book shop management system using Drizzle ORM and Cloudflare D1 database. Built with Bun.js for optimal performance as part of the FBP-Bookshop monorepo.

## Features

- 📚 Complete database schema for books, genres, and publishers
- 🔄 Full CRUD operations with type-safe repositories
- 🔗 Many-to-many relationship support (books with multiple genres)
- 🚀 Optimized for Cloudflare D1 and Workers
- 💪 Written in TypeScript with full type safety
- ⚡ Built with Bun.js for fast development

## Database Schema

### Tables

- **book**: Stores book information including title, author, ISBN, barcode, price, language
- **genre**: Book genres/categories (e.g., Fiction, Non-Fiction, Science)
- **book_genre**: Intersection table for the many-to-many relationship between books and genres
- **publisher**: Publishing companies
- **upload_status**: Tracks the status of Excel file uploads and background processing

### Relationships

- Books can have many genres via **book_genre**
- Books can have one publisher - nullable relationship
- Genres can have many books
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
// Create a book with multiple genres
const newBook = await repos.books.create({
  title: "The Great Gatsby",
  author: "F. Scott Fitzgerald",
  isbn: "978-0743273565",
  barcode: "9780743273565",
  price: 15.99,
  language: "English",
  genreIds: [1, 2],
  publisherId: 1,
});

// Find book by ID with relations (includes genres and publisher)
const book = await repos.books.findByIdWithRelations(1);

// Search books with filters
const searchResults = await repos.books.findWithFilters({
  title: "Gatsby",
  genreId: 1,
});

// Update book and its genres
await repos.books.update(1, {
  price: 12.99,
  genreIds: [1, 3],
});
```

#### Genre Repository

```typescript
// Create a genre
const newGenre = await repos.genres.create({
  name: "Science Fiction",
});

// Get genre with all its books
const genreWithBooks = await repos.genres.findByIdWithBooks(1);

// Search genres
const genres = await repos.genres.search("Fiction");
```

#### Publisher Repository

```typescript
// Create a publisher
const newPublisher = await repos.publishers.create({
  name: "Penguin Random House",
});

// Get publisher with all its books
const publisherWithBooks = await repos.publishers.findByIdWithBooks(1);
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
│   │   ├── genre.repository.ts
│   │   ├── publisher.repository.ts
│   │   └── upload-status.repository.ts
│   │   └── index.ts
│   ├── db.ts                 # Database initialization
│   └── index.ts              # Main entry point
├── drizzle/                  # Generated migrations
├── drizzle.config.ts         # Drizzle configuration
├── wrangler.toml             # Cloudflare configuration
├── tsconfig.json
└── package.json
```

## License

MIT
