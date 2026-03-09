# fbp-excel-extractor

A **Bun.js / TypeScript** library that extracts structured data from `FBP-DB.xlsx` — a Portuguese book-catalogue spreadsheet.  
Designed to be consumed as a Git dependency inside a larger project.

---

## Features

| Function | Extracts | Column key |
|---|---|---|
| `extractGenre` | Unique genre/category records | `Género` |
| `extractPublisher` | Unique publishing house records | `Editora` |
| `extractBook` | Full book records (enriched with Genres & Publisher) | `Nome`, `Autor`, `ISBN`, … |

- **Deduplication** — genres and publishers are returned without duplicates (case-insensitive).
- **Entity linking** — each book carries a resolved list of `Genre` objects and a `Publisher` object.
- **Deduplication for books** — books whose ISBN **or** barcode matches an existing title are skipped.
- **Safe cell reading** — handles numeric, string, and empty cells without crashing.

---

## Usage

```typescript
import { extractGenre, extractPublisher, extractBook } from "fbp-excel-extractor";

const FILE = "./FBP-DB.xlsx";

// Extract genres
const { items: genres, count: genreCount } = extractGenre(FILE);
console.log(`Found ${genreCount} genres:`, genres);

// Extract publishers
const { items: publishers, count: publisherCount } = extractPublisher(FILE);
console.log(`Found ${publisherCount} publishers:`, publishers);

// Extract books (calls extractGenre + extractPublisher internally)
const { items: books, count: bookCount } = extractBook(FILE);
console.log(`Found ${bookCount} books`);

// Each book has fully resolved Genre array and Publisher object:
const first = books[0];
console.log(first.title);          // "Laques"
console.log(first.genres.map(g => g.name).join(', '));   // "Filosofia"
console.log(first.publisher?.name); // "Ed 70"
```

---

## API Reference

### `extractGenre(filePath: string): ExtractionResult<Genre>`

Reads the first sheet of the workbook and collects unique values from the **`Género`** column. Supports splitting Multiple genres per cell using the `/` delimiter.

```typescript
interface Genre {
  id: number;   // auto-incremented, 1-based
  name: string;
}
```

Throws if the `género` header column is not found.

---

### `extractPublisher(filePath: string): ExtractionResult<Publisher>`

Reads the first sheet and collects unique values from the **`Editora`** column.

```typescript
interface Publisher {
  id: number;   // auto-incremented, 1-based
  name: string;
}
```

---

### `extractBook(filePath: string): ExtractionResult<Book>`

Reads the first sheet. Internally calls `extractGenre` and `extractPublisher` first, building in-memory lookup maps. Each book row is enriched with its matching `Genres` list and `Publisher`.

```typescript
interface Book {
  title: string;
  author: string | null;
  isbn: string | null;
  barcode: string | null;
  price: number | null;
  language: string | null;
  genres: Genre[];
  publisher: Publisher | null;
}
```

**Column mapping (Portuguese → field):**

| Spreadsheet column | Book field |
|---|---|
| `Nome` | `title` |
| `Autor` | `author` |
| `ISBN` | `isbn` |
| `Codigo Barras` | `barcode` |
| `Preço` | `price` |
| `Lingua` | `language` |
| `Género` | `genres` |
| `Editora` | `publisher` |

---

## Development

```bash
# Install dependencies
bun install

# Run tests (requires FBP-DB.xlsx in project root)
bun test

# Build for distribution
bun run build
```

---

## License

MIT
