# fbp-excel-extractor

A **Bun.js / TypeScript** library that extracts structured data from `FBP-DB.xlsx` — a Portuguese book-catalogue spreadsheet.  
Designed to be consumed as a Git dependency inside a larger project.

---

## Features

| Function | Extracts | Column key |
|---|---|---|
| `extractGender` | Unique genre/category records | `Género` |
| `extractPublisher` | Unique publishing house records | `Editora` |
| `extractBook` | Full book records (enriched with Gender & Publisher) | `Nome`, `Autor`, `ISBN`, … |

- **Deduplication** — genders and publishers are returned without duplicates (case-insensitive).
- **Entity linking** — each book carries a resolved `Gender` and `Publisher` object, not just a string.
- **Deduplication for books** — books whose ISBN **or** barcode matches an existing title are skipped.
- **Safe cell reading** — handles numeric, string, and empty cells without crashing.

---

## Installation (as a Git dependency)

```jsonc
// package.json
{
  "dependencies": {
    "fbp-excel-extractor": "git+https://github.com/<your-org>/fbp-excel-extractor.git"
  }
}
```

Then:

```bash
bun install
```

---

## Usage

```typescript
import { extractGender, extractPublisher, extractBook } from "fbp-excel-extractor";

const FILE = "./FBP-DB.xlsx";

// Extract genders
const { items: genders, count: genderCount } = extractGender(FILE);
console.log(`Found ${genderCount} genders:`, genders);

// Extract publishers
const { items: publishers, count: publisherCount } = extractPublisher(FILE);
console.log(`Found ${publisherCount} publishers:`, publishers);

// Extract books (calls extractGender + extractPublisher internally)
const { items: books, count: bookCount } = extractBook(FILE);
console.log(`Found ${bookCount} books`);

// Each book has fully resolved Gender and Publisher objects:
const first = books[0];
console.log(first.title);          // "Laques"
console.log(first.gender?.name);   // "Filosofia"
console.log(first.publisher?.name); // "Ed 70"
```

---

## API Reference

### `extractGender(filePath: string): ExtractionResult<Gender>`

Reads the first sheet of the workbook and collects unique values from the **`Género`** column.

```typescript
interface Gender {
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

Throws if the `editora` header column is not found.

---

### `extractBook(filePath: string): ExtractionResult<Book>`

Reads the first sheet. Internally calls `extractGender` and `extractPublisher` first, building in-memory lookup maps. Each book row is enriched with its matching `Gender` and `Publisher`.

```typescript
interface Book {
  title: string;
  author: string | null;
  isbn: string | null;
  barcode: string | null;
  price: number | null;
  language: string | null;
  gender: Gender | null;
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
| `Género` | `gender` |
| `Editora` | `publisher` |

Throws if the mandatory `nome` (title) column is not found.

---

### `ExtractionResult<T>`

Returned by all three functions:

```typescript
interface ExtractionResult<T> {
  items: T[];    // the extracted records
  count: number; // same as items.length
}
```

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

## Expected spreadsheet structure

The library reads the **first sheet** of the workbook and expects a **header row** in row 1 with at minimum the column `Nome`. All column matching is **case-insensitive**.

| Column | Purpose | Required |
|---|---|---|
| Nome | Book title | ✅ |
| Autor | Author | optional |
| ISBN | ISBN | optional |
| Codigo Barras | Barcode | optional |
| Preço | Price | optional |
| Lingua | Language | optional |
| Género | Genre / category | optional (for gender extraction: required) |
| Editora | Publisher | optional (for publisher extraction: required) |

---

## License

MIT
