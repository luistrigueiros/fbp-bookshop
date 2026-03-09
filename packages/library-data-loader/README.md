# Library Data Loader

Service for asynchronous bulk upload and processing of book data from Excel files.

## Features

- **Hono-based API**: Simple REST endpoints for upload and status tracking.
- **R2 Storage**: Stores uploaded Excel files for processing.
- **Cloudflare Queues**: Orchestrates background processing to avoid timeouts.
- **D1 Database**: Inserts extracted book, genre, and publisher data.
- **Many-to-Many support**: Correctly handles books with multiple genres.

## API Usage

### Upload a file

```bash
curl -X POST <WORKER_URL>/upload -F "file=@test/FBP-DB.xlsx"
```

Returns a `key` for status tracking.

### Check upload status

```bash
curl <WORKER_URL>/upload-status/<key>
```

Returns JSON with processing status, book count, and potential errors.

## Development

```bash
bun install
bun run dev
bun run deploy
```

Tests require a D1 and R2 environment:

```bash
bun test
```