# Implementation Plan: Book Media Support

## Overview

Implement book media support across four packages in order: `library-data-layer` (schema + repository), `library-trpc` (router), `library-app` (backend routes + R2 utilities), and `library-app` frontend (SolidJS components). Each layer is built before the next depends on it.

## Tasks

- [x] 1. library-data-layer: Schema and migration
  - [x] 1.1 Add `bookMedia` Drizzle table definition to `packages/library-data-layer/src/schema/index.ts`
    - Add `bookMedia` sqliteTable with all columns: `id`, `bookId`, `mediaType`, `mediaCategory`, `r2Key`, `fileName`, `fileSize`, `mimeType`, `width`, `height`, `thumbnailKey`, `displayOrder`, `isPrimary`, `description`, `uploadedAt`, `duration`
    - Add `index`, `uniqueIndex` imports from `drizzle-orm/sqlite-core`
    - Add `bookMediaRelations` (belongs to `book`) and extend `bookRelations` with `media: many(bookMedia)`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.6, 1.7_

  - [x] 1.2 Create migration file `packages/library-data-layer/drizzle/0001_book_media.sql`
    - Write `CREATE TABLE book_media` SQL with all columns and FK constraint `ON DELETE CASCADE`
    - Add `CREATE INDEX book_media_book_idx`, `CREATE UNIQUE INDEX book_media_r2key_idx`, `CREATE INDEX book_media_primary_idx`
    - _Requirements: 1.2, 1.3, 1.4, 1.5_

  - [x] 1.3 Add `BookMedia`, `NewBookMedia`, `BookMediaWithUrls` types to `packages/library-data-layer/src/schema/types.ts`
    - Import `bookMedia` from `./index`
    - Export `BookMedia = InferSelectModel<typeof bookMedia>`, `NewBookMedia = InferInsertModel<typeof bookMedia>`
    - Export `BookMediaWithUrls = BookMedia & { url: string; thumbnailUrl: string | null }`
    - _Requirements: 1.1_

- [x] 2. library-data-layer: BookMediaRepository
  - [x] 2.1 Create `packages/library-data-layer/src/repositories/book-media.repository.ts`
    - Implement `BookMediaRepository` class with constructor `(private db: DB)`
    - Implement `create(data: NewBookMedia): Promise<BookMedia>`
    - Implement `findByBookId(bookId: number): Promise<BookMedia[]>` ordered by `displayOrder ASC`
    - Implement `findByBookIdAndCategory(bookId: number, category: string): Promise<BookMedia[]>`
    - Implement `findById(id: number): Promise<BookMedia | undefined>`
    - Implement `delete(id: number): Promise<boolean>`
    - Implement `updateOrder(id: number, displayOrder: number, isPrimary: boolean): Promise<BookMedia | undefined>`
    - Implement `clearPrimary(bookId: number, category: string): Promise<void>` — sets `isPrimary = false` for all records matching bookId + category
    - Use `layerLogger` for debug/info logging consistent with other repositories
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [ ]* 2.2 Write property test for BookMediaRepository — P4: insert then retrieve round-trip
    - **Property 4: Insert then retrieve round-trip**
    - **Validates: Requirements 2.1, 5.1**

  - [ ]* 2.3 Write property test for BookMediaRepository — P5: findByBookId ordering invariant
    - **Property 5: findByBookId ordering invariant**
    - **Validates: Requirements 2.2, 6.1**

  - [ ]* 2.4 Write property test for BookMediaRepository — P6: category filter correctness
    - **Property 6: Category filter correctness**
    - **Validates: Requirements 2.3, 6.2**

  - [ ]* 2.5 Write property test for BookMediaRepository — P7: delete returns correct boolean
    - **Property 7: Delete returns correct boolean**
    - **Validates: Requirements 2.4**

  - [ ]* 2.6 Write property test for BookMediaRepository — P1: cascade delete removes media records
    - **Property 1: Cascade delete removes media records**
    - **Validates: Requirements 1.2**

  - [ ]* 2.7 Write property test for BookMediaRepository — P2: r2Key uniqueness constraint
    - **Property 2: r2Key uniqueness constraint**
    - **Validates: Requirements 1.3**

  - [ ]* 2.8 Write property test for BookMediaRepository — P3: enum constraint enforcement
    - **Property 3: Enum constraint enforcement**
    - **Validates: Requirements 1.6, 1.7**

  - [ ]* 2.9 Write property test for BookMediaRepository — P8: FK constraint on invalid bookId
    - **Property 8: FK constraint propagated on invalid bookId**
    - **Validates: Requirements 2.6**

  - [ ]* 2.10 Write property test for BookMediaRepository — P16: isPrimary exclusivity invariant
    - **Property 16: isPrimary exclusivity invariant**
    - **Validates: Requirements 5.8**

  - [x] 2.11 Export `BookMediaRepository` from `packages/library-data-layer/src/repositories/index.ts`
    - Add `export { BookMediaRepository } from './book-media.repository'`
    - _Requirements: 2.7_

  - [x] 2.12 Register `BookMediaRepository` in `packages/library-data-layer/src/index.ts`
    - Import `BookMediaRepository` from `./repositories`
    - Add `bookMedia: BookMediaRepository` to `LibraryRepositories` interface
    - Add `bookMedia: new BookMediaRepository(db)` to `createRepositories()` return value
    - _Requirements: 2.7_

- [x] 3. Checkpoint — data layer complete
  - Ensure all tests pass, ask the user if questions arise.


- [x] 4. library-trpc: Extend context and add bookMediaRouter
  - [x] 4.1 Extend `tRPCContext` in `packages/library-trpc/src/trpc.ts`
    - Add `import type { R2Bucket } from '@cloudflare/workers-types'`
    - Add `r2?: R2Bucket` field to the `tRPCContext` interface
    - _Requirements: 8.1, 8.2, 8.3_

  - [x] 4.2 Create `packages/library-trpc/src/routers/book-media.ts`
    - Import `z`, `router`, `publicProcedure`, `TRPCError` from their respective modules
    - Implement `bookMedia.getByBook` query: input `{ bookId: z.number(), mediaCategory: z.string().optional() }`, look up book (throw `NOT_FOUND` if missing), call `findByBookId` or `findByBookIdAndCategory`, map each record to add `url: /api/media/${r2Key}` and `thumbnailUrl: thumbnailKey ? /api/media/${thumbnailKey} : null`, return `BookMediaWithUrls[]`
    - Implement `bookMedia.delete` mutation: input `{ id: z.number() }`, look up record (throw `NOT_FOUND` if missing), delete R2 object at `record.r2Key` via `ctx.r2` (throw `INTERNAL_SERVER_ERROR` on failure), delete thumbnail if `thumbnailKey` non-null, call `bookMedia.delete(id)`, check remaining records and delete manifest if none remain
    - _Requirements: 8.2, 8.3, 8.5, 8.6, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 7.1, 7.2, 7.3, 7.4_

  - [x] 4.3 Register `bookMediaRouter` in `packages/library-trpc/src/routers/_app.ts`
    - Import `bookMediaRouter` from `./book-media`
    - Add `bookMedia: bookMediaRouter` to the `appRouter` object
    - _Requirements: 8.4_

  - [ ]* 4.4 Write property test — P17: URL fields present in retrieval response
    - **Property 17: URL fields present in retrieval response**
    - **Validates: Requirements 6.3, 6.4**

- [x] 5. library-app: R2 binding configuration and context wiring
  - [x] 5.1 Add `[[r2_buckets]]` binding to `packages/library-app/wrangler.toml`
    - Append `[[r2_buckets]]` section with `binding = "MEDIA_BUCKET"` and `bucket_name = "library-media"`
    - _Requirements: 5.1_

  - [x] 5.2 Update `Env` interface and `Bindings` type with `MEDIA_BUCKET: R2Bucket`
    - In `packages/library-app/src/context.ts`: add `import type { R2Bucket } from '@cloudflare/workers-types'` and add `MEDIA_BUCKET: R2Bucket` to `Env`
    - In `packages/library-app/src/index.ts`: add `MEDIA_BUCKET: R2Bucket` to the `Bindings` type
    - _Requirements: 5.1_

  - [x] 5.3 Pass `r2` through `createContext` in `packages/library-app/src/context.ts`
    - Add `r2: opts.env.MEDIA_BUCKET` to the returned context object
    - _Requirements: 5.1_


- [x] 6. library-app: Media utility files
  - [x] 6.1 Create `packages/library-app/src/media/r2Keys.ts`
    - Implement `sanitiseFilename(name: string): string` — replace any char not in `[a-zA-Z0-9._-]` with `_`
    - Implement `buildMediaKey(bookId: number, category: string, timestamp: number, filename: string): string` — returns `books/${bookId}/${category}/${timestamp}-${sanitisedFilename}`
    - Implement `buildThumbnailKey(bookId: number, category: string, timestamp: number, filename: string): string` — returns `books/${bookId}/${category}/${timestamp}-thumb-${sanitisedFilename}`
    - Implement `buildManifestKey(bookId: number): string` — returns `books/${bookId}/manifest.json`
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ]* 6.2 Write property test — P9: R2 key format invariant
    - **Property 9: R2 key format invariant**
    - **Validates: Requirements 3.1, 3.2**

  - [ ]* 6.3 Write property test — P10: filename sanitisation character set
    - **Property 10: Filename sanitisation character set**
    - **Validates: Requirements 3.3**

  - [x] 6.4 Create `packages/library-app/src/media/imageProcessor.ts`
    - Import `@jsquash/jpeg`, `@jsquash/png`, `@jsquash/resize`
    - Implement `processImage(buffer: ArrayBuffer, mimeType: string): Promise<{ optimised: ArrayBuffer, thumbnail: ArrayBuffer, width: number, height: number }>`
    - Decode input buffer using the appropriate jsquash decoder based on mimeType
    - Extract `width` and `height` from decoded image data
    - Generate thumbnail by resizing to max 200px on the longest side using `@jsquash/resize`
    - Re-encode both optimised and thumbnail as JPEG using `@jsquash/jpeg`
    - _Requirements: 5.2, 5.3_

  - [x] 6.5 Create `packages/library-app/src/media/manifest.ts`
    - Implement `writeManifest(r2: R2Bucket, bookId: number, bookRecord: Book): Promise<void>`
    - Serialise `{ id, title, author, isbn, barcode, language, publisherId }` from `bookRecord` to JSON
    - Call `r2.put(buildManifestKey(bookId), json, { httpMetadata: { contentType: 'application/json' } })`
    - Implement `deleteManifest(r2: R2Bucket, bookId: number): Promise<void>` — calls `r2.delete(buildManifestKey(bookId))`
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ]* 6.6 Write property test — P12: manifest round-trip
    - **Property 12: Manifest round-trip**
    - **Validates: Requirements 11.2, 11.3**


- [x] 7. library-app: Hono upload and proxy routes
  - [x] 7.1 Add Hono `POST /api/books/:bookId/media` upload route to `packages/library-app/src/index.ts`
    - Parse `bookId` from path params; look up book via `repositories.books.findById` — return 404 if not found
    - Parse multipart form: extract `file`, `mediaCategory`, `isPrimary`, `description` fields
    - Validate `mediaCategory` is one of `cover | back_cover | promotional | interview | event` — return 400 if invalid
    - Check file size ≤ 100 MB — return 413 if exceeded
    - Build `r2Key` using `buildMediaKey` with `Date.now()` as timestamp
    - Call `c.env.MEDIA_BUCKET.put(r2Key, fileBuffer, { httpMetadata: { contentType: mimeType } })` — return 500 on failure, do not insert DB record
    - If image MIME type: call `processImage`, store thumbnail via `c.env.MEDIA_BUCKET.put(thumbnailKey, thumbnail.buffer)`
    - If `isPrimary === 'true'`: call `repositories.bookMedia.clearPrimary(bookId, mediaCategory)`
    - Call `repositories.bookMedia.create(record)` to insert DB record
    - Call `writeManifest(c.env.MEDIA_BUCKET, bookId, bookRecord)` after successful insert
    - Return `{ id, r2Key, thumbnailKey, url: /api/media/${r2Key} }`
    - _Requirements: 5.1, 5.2, 5.3, 5.5, 5.6, 5.7, 5.8, 4.1_

  - [x] 7.2 Add Hono `GET /api/media/*` proxy route to `packages/library-app/src/index.ts`
    - Extract the wildcard path segment as the R2 key
    - Call `c.env.MEDIA_BUCKET.get(r2Key)` — return 404 if object is null
    - Set `Content-Type` from `object.httpMetadata?.contentType`
    - Stream `object.body` as the response body
    - Register this route before the tRPC catch-all `/api/*` handler
    - _Requirements: 6.3, 6.4_

  - [ ]* 7.3 Write property test — P18: upload atomicity — no DB record on R2 failure
    - **Property 18: Upload atomicity — no DB record on R2 failure**
    - **Validates: Requirements 5.7**

  - [ ]* 7.4 Write property test — P19: delete atomicity — no DB deletion on R2 failure
    - **Property 19: Delete atomicity — no DB deletion on R2 failure**
    - **Validates: Requirements 7.4**

  - [ ]* 7.5 Write property test — P11: manifest written after upload
    - **Property 11: Manifest written after upload**
    - **Validates: Requirements 4.1, 4.2, 5.1**

  - [ ]* 7.6 Write property test — P13: manifest deleted when no media remains
    - **Property 13: Manifest deleted when no media remains**
    - **Validates: Requirements 4.3**

  - [ ]* 7.7 Write property test — P14: thumbnail generated for image uploads
    - **Property 14: Thumbnail generated for image uploads**
    - **Validates: Requirements 5.2**

  - [ ]* 7.8 Write property test — P15: image dimensions recorded
    - **Property 15: Image dimensions recorded**
    - **Validates: Requirements 5.3**

  - [ ]* 7.9 Write property test — P20: delete removes R2 objects
    - **Property 20: Delete removes R2 objects**
    - **Validates: Requirements 7.1, 7.2**

- [x] 8. library-app: Regenerate migrations bundle
  - Run `bun run bundle-migrations` inside `packages/library-app` to regenerate `src/migrations.ts` with the new `0001_book_media.sql` migration included
  - Verify `src/migrations.ts` now contains two migration entries
  - _Requirements: 1.5_

- [x] 9. Checkpoint — backend complete
  - Ensure all tests pass, ask the user if questions arise.


- [x] 10. library-app frontend: BookMediaGallery component
  - [x] 10.1 Create `packages/library-app/src/frontend/components/BookMediaGallery.tsx`
    - Define `BookMediaGalleryProps { bookId: number; editMode?: boolean; onDeleted?: (id: number) => void }`
    - On mount call `trpc.bookMedia.getByBook.query({ bookId })` and store result in a signal
    - Render primary cover image (first record with `mediaCategory === 'cover'` and `isPrimary === true`) prominently
    - Render thumbnail grid for remaining image records using `thumbnailUrl` as `<img src>`
    - Clicking a thumbnail opens a lightbox showing the full-size `url`
    - Render `<video controls src={url}>` for video media records
    - Show a placeholder `<p>` when the media array is empty
    - In `editMode`, render a delete button per item that calls `trpc.bookMedia.delete.mutate({ id })` then calls `onDeleted(id)` and removes the item from the local signal
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 10.6_

- [x] 11. library-app frontend: BookMediaUpload component
  - [x] 11.1 Create `packages/library-app/src/frontend/components/BookMediaUpload.tsx`
    - Define `BookMediaUploadProps { bookId: number; onUploaded?: () => void }`
    - Render a `<form>` with: file `<input type="file">`, `<select>` for `mediaCategory` (options: cover, back_cover, promotional, interview, event), optional `<input>` for description, and a submit button
    - On file selection, display the file name and formatted file size
    - On submit, build a `FormData` object and `fetch('POST', /api/books/${bookId}/media, { body: formData })`
    - Show a loading indicator (disable submit button) while the request is in flight
    - On success (HTTP 200), call `onUploaded()` to trigger gallery refresh
    - On failure, parse the response body and display the `error` field as an error message
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 12. library-app frontend: Integrate components into book detail page
  - [x] 12.1 Import and render `BookMediaGallery` and `BookMediaUpload` in the book detail route/page component
    - Locate the existing book detail page in `packages/library-app/src/frontend/routes/`
    - Import `BookMediaGallery` and `BookMediaUpload`
    - Render `<BookMediaGallery bookId={book.id} editMode={isEditMode()} onDeleted={handleDeleted} />` in the media section
    - Render `<BookMediaUpload bookId={book.id} onUploaded={refreshGallery} />` when in edit mode
    - Wire `onUploaded` / `onDeleted` callbacks to re-fetch the gallery (e.g. increment a refresh counter signal passed to `BookMediaGallery`)
    - _Requirements: 9.1, 9.2, 9.5, 10.1, 10.4, 10.6_

- [x] 13. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use `fast-check` with `numRuns: 100` and are tagged with `// Feature: book-media-support, Property N: ...`
- The Hono media proxy route (`GET /api/media/*`) must be registered before the tRPC catch-all (`/api/*`) in `src/index.ts`
- After adding `0001_book_media.sql`, run `bun run bundle-migrations` in `packages/library-app` before testing the Worker locally
