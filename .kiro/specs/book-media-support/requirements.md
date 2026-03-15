# Requirements Document

## Introduction

This feature adds media file support to the library application, allowing books to have associated images and videos (cover pages, back covers, promotional images, event videos, author interviews). Media files are stored in Cloudflare R2 object storage, with metadata pointers kept in a `bookMedia` database table. A JSON manifest file at the root of each book's R2 folder enables database reconstruction if needed. The feature spans the data layer (`library-data-layer`), API layer (`library-trpc`), and frontend (`library-app`).

## Glossary

- **BookMedia**: A database record linking a book to a media file stored in R2, including metadata such as type, category, size, and display order.
- **Media_Upload_Service**: The service responsible for accepting file uploads, storing them in R2, and persisting metadata to the `bookMedia` table.
- **Media_Fetch_Service**: The service responsible for retrieving media records from the database and generating access URLs for R2 objects.
- **Book_Manifest**: A JSON file stored at `books/{bookId}/manifest.json` in R2 containing the book's database record, used to rebuild the linkage between the book table and R2 media folder.
- **R2**: Cloudflare R2 object storage used to store media files.
- **D1**: Cloudflare D1 SQLite database used to store book and media metadata.
- **Media_Router**: The tRPC router in `library-trpc` that exposes media upload, retrieval, and deletion procedures.
- **Media_Repository**: The data access class in `library-data-layer` that performs CRUD operations on the `bookMedia` table.
- **Thumbnail**: A reduced-size image variant generated from an uploaded image, stored separately in R2.
- **R2_Key**: The unique string identifier for an object stored in R2, following the pattern `books/{bookId}/{category}/{timestamp}-{filename}`.
- **mediaType**: The broad type of a media file: `image` or `video`.
- **mediaCategory**: The semantic role of a media file: `cover`, `back_cover`, `promotional`, `interview`, or `event`.
- **Signed_URL**: A time-limited URL granting temporary read access to a private R2 object.

## Requirements

### Requirement 1: bookMedia Database Table

**User Story:** As a developer, I want a `bookMedia` table in the database, so that media file metadata and R2 storage keys are persisted and queryable alongside book records.

#### Acceptance Criteria

1. THE `library-data-layer` SHALL define a `bookMedia` table in the Drizzle schema with the following columns: `id`, `bookId`, `mediaType`, `mediaCategory`, `r2Key`, `fileName`, `fileSize`, `mimeType`, `width`, `height`, `thumbnailKey`, `displayOrder`, `isPrimary`, `description`, `uploadedAt`, and `duration`.
2. THE `bookMedia` table SHALL enforce a foreign key constraint on `bookId` referencing the `book` table with `ON DELETE CASCADE`.
3. THE `bookMedia` table SHALL enforce a unique index on `r2Key` to prevent duplicate R2 object references.
4. THE `bookMedia` table SHALL include an index on `bookId` to support efficient retrieval of all media for a given book.
5. THE `library-data-layer` SHALL provide a Drizzle migration file that creates the `bookMedia` table.
6. THE `mediaType` column SHALL accept only the values `image` or `video`.
7. THE `mediaCategory` column SHALL accept only the values `cover`, `back_cover`, `promotional`, `interview`, or `event`.

---

### Requirement 2: Media Repository

**User Story:** As a developer, I want a `BookMediaRepository` class in `library-data-layer`, so that all database operations for book media are encapsulated and reusable.

#### Acceptance Criteria

1. THE `Media_Repository` SHALL provide a method to insert a new `bookMedia` record given all required fields.
2. THE `Media_Repository` SHALL provide a method to retrieve all `bookMedia` records for a given `bookId`, ordered by `displayOrder` ascending.
3. THE `Media_Repository` SHALL provide a method to retrieve all `bookMedia` records for a given `bookId` and `mediaCategory`.
4. THE `Media_Repository` SHALL provide a method to delete a `bookMedia` record by `id`, returning a boolean indicating whether a record was deleted.
5. THE `Media_Repository` SHALL provide a method to update the `displayOrder` and `isPrimary` fields of a `bookMedia` record by `id`.
6. WHEN a `bookId` that does not exist in the `book` table is provided to the insert method, THE `Media_Repository` SHALL propagate the database constraint error to the caller.
7. THE `library-data-layer` SHALL export `BookMediaRepository` from its public index.

---

### Requirement 3: R2 Key Structure

**User Story:** As a developer, I want a consistent R2 key naming convention, so that media files are organised predictably and all files for a book can be listed by prefix.

#### Acceptance Criteria

1. THE `Media_Upload_Service` SHALL generate R2 keys following the pattern `books/{bookId}/{mediaCategory}/{timestamp}-{sanitisedFilename}` for all uploaded media files.
2. THE `Media_Upload_Service` SHALL generate thumbnail R2 keys following the pattern `books/{bookId}/{mediaCategory}/{timestamp}-thumb-{sanitisedFilename}` for image thumbnails.
3. THE `Media_Upload_Service` SHALL sanitise filenames by replacing any character that is not alphanumeric, a hyphen, an underscore, or a period with an underscore before constructing the R2 key.
4. THE `Media_Upload_Service` SHALL use the Unix timestamp in milliseconds at the time of upload as the `{timestamp}` component of the R2 key.

---

### Requirement 4: Book Manifest File

**User Story:** As an operator, I want a JSON manifest file stored in R2 for each book that has media, so that the linkage between the book table and its R2 media folder can be reconstructed if the database is lost.

#### Acceptance Criteria

1. WHEN a media file is successfully uploaded for a book, THE `Media_Upload_Service` SHALL write or overwrite a JSON file at `books/{bookId}/manifest.json` in R2 containing the current book record from the `book` table.
2. THE manifest file SHALL be a valid JSON object containing at minimum the fields: `id`, `title`, `author`, `isbn`, `barcode`, `language`, and `publisherId` from the `book` table.
3. WHEN a media file is deleted and no media records remain for a book, THE `Media_Upload_Service` SHALL delete the manifest file at `books/{bookId}/manifest.json` from R2.
4. THE manifest file SHALL be stored with MIME type `application/json`.

---

### Requirement 5: Media Upload

**User Story:** As a librarian, I want to upload image and video files for a book, so that media content is stored in R2 and linked to the book record.

#### Acceptance Criteria

1. WHEN a valid file upload request is received with a `bookId`, `mediaCategory`, and file payload, THE `Media_Upload_Service` SHALL store the file in R2 using the key pattern defined in Requirement 3 and insert a corresponding `bookMedia` record.
2. WHEN the uploaded file has a MIME type beginning with `image/`, THE `Media_Upload_Service` SHALL generate a thumbnail and store it in R2 under the thumbnail key pattern defined in Requirement 3.
3. WHEN the uploaded file has a MIME type beginning with `image/`, THE `Media_Upload_Service` SHALL record the `width` and `height` of the original image in the `bookMedia` record.
4. WHEN the uploaded file has a MIME type beginning with `video/`, THE `Media_Upload_Service` SHALL record the `duration` in seconds in the `bookMedia` record if the duration can be determined.
5. IF the `bookId` provided in the upload request does not correspond to an existing book, THEN THE `Media_Upload_Service` SHALL return an error response with HTTP status 404.
6. IF the uploaded file exceeds 100 MB, THEN THE `Media_Upload_Service` SHALL return an error response with HTTP status 413.
7. IF the R2 upload fails, THEN THE `Media_Upload_Service` SHALL not insert a `bookMedia` record and SHALL return an error response with HTTP status 500.
8. WHEN `isPrimary` is set to `true` in the upload request, THE `Media_Upload_Service` SHALL set `isPrimary` to `false` on all existing `bookMedia` records for the same `bookId` and `mediaCategory` before inserting the new record.

---

### Requirement 6: Media Retrieval

**User Story:** As a frontend user, I want to retrieve all media associated with a book, so that images and videos can be displayed on the book detail page.

#### Acceptance Criteria

1. WHEN a request to retrieve media for a valid `bookId` is received, THE `Media_Fetch_Service` SHALL return all `bookMedia` records for that book ordered by `displayOrder` ascending.
2. WHEN a `mediaCategory` filter is provided alongside a `bookId`, THE `Media_Fetch_Service` SHALL return only `bookMedia` records matching both the `bookId` and `mediaCategory`.
3. FOR EACH `bookMedia` record returned, THE `Media_Fetch_Service` SHALL include a `url` field containing a `Signed_URL` valid for at least 3600 seconds granting read access to the R2 object.
4. FOR EACH `bookMedia` record that has a non-null `thumbnailKey`, THE `Media_Fetch_Service` SHALL include a `thumbnailUrl` field containing a `Signed_URL` valid for at least 3600 seconds.
5. IF the `bookId` provided does not correspond to an existing book, THEN THE `Media_Fetch_Service` SHALL return an error response with HTTP status 404.
6. WHEN a `bookId` with no associated media records is requested, THE `Media_Fetch_Service` SHALL return an empty array.

---

### Requirement 7: Media Deletion

**User Story:** As a librarian, I want to delete a media file associated with a book, so that outdated or incorrect media is removed from both R2 and the database.

#### Acceptance Criteria

1. WHEN a valid delete request is received for a `bookMedia` record `id`, THE `Media_Upload_Service` SHALL delete the corresponding object from R2 and then delete the `bookMedia` record from the database.
2. WHEN the deleted `bookMedia` record has a non-null `thumbnailKey`, THE `Media_Upload_Service` SHALL also delete the thumbnail object from R2.
3. IF the `bookMedia` record with the given `id` does not exist, THEN THE `Media_Upload_Service` SHALL return an error response with HTTP status 404.
4. IF the R2 deletion fails, THEN THE `Media_Upload_Service` SHALL not delete the `bookMedia` database record and SHALL return an error response with HTTP status 500.

---

### Requirement 8: tRPC Media Router

**User Story:** As a frontend developer, I want tRPC procedures for media operations, so that the frontend can upload, retrieve, and delete book media using the existing tRPC client.

#### Acceptance Criteria

1. THE `Media_Router` SHALL expose an `upload` mutation that accepts `bookId`, `mediaCategory`, `isPrimary`, `description`, and a file payload, and delegates to the `Media_Upload_Service`.
2. THE `Media_Router` SHALL expose a `getByBook` query that accepts `bookId` and an optional `mediaCategory`, and delegates to the `Media_Fetch_Service`.
3. THE `Media_Router` SHALL expose a `delete` mutation that accepts a `bookMedia` record `id`, and delegates to the `Media_Upload_Service` deletion logic.
4. THE `library-trpc` package SHALL register the `Media_Router` under the key `bookMedia` in the root `appRouter`.
5. WHEN a tRPC procedure receives invalid input, THE `Media_Router` SHALL return a tRPC `BAD_REQUEST` error with a descriptive message.
6. WHEN a tRPC procedure encounters a not-found condition, THE `Media_Router` SHALL return a tRPC `NOT_FOUND` error.

---

### Requirement 9: Frontend Media Display

**User Story:** As a library visitor, I want to see cover images and other media on the book detail page, so that I can visually identify books.

#### Acceptance Criteria

1. WHEN a book detail page is loaded and the book has at least one `bookMedia` record with `mediaCategory` of `cover`, THE frontend SHALL display the primary cover image prominently.
2. WHEN a book has multiple media files, THE frontend SHALL display thumbnails for image media in a gallery section on the book detail page.
3. WHEN a thumbnail is clicked, THE frontend SHALL display the full-size image using a `Signed_URL`.
4. WHEN a book has video media, THE frontend SHALL render a video player element using the `Signed_URL` as the source.
5. WHEN a book has no associated media, THE frontend SHALL display a placeholder indicating no media is available.

---

### Requirement 10: Frontend Media Upload UI

**User Story:** As a librarian, I want an upload interface on the book detail edit page, so that I can attach media files to a book.

#### Acceptance Criteria

1. WHEN the book detail page is in edit mode, THE frontend SHALL display a media upload section allowing selection of a file, a `mediaCategory`, and an optional description.
2. WHEN a file is selected for upload, THE frontend SHALL display the file name and size before submission.
3. WHEN the upload form is submitted, THE frontend SHALL call the `bookMedia.upload` tRPC mutation and display a loading indicator until the operation completes.
4. WHEN the upload completes successfully, THE frontend SHALL refresh the media list for the book without requiring a full page reload.
5. IF the upload fails, THE frontend SHALL display an error message describing the failure.
6. WHEN a media item is displayed in edit mode, THE frontend SHALL provide a delete button that calls the `bookMedia.delete` tRPC mutation and removes the item from the displayed list on success.

---

### Requirement 11: Manifest Round-Trip Integrity

**User Story:** As an operator, I want the book manifest in R2 to always reflect the current book record, so that database reconstruction produces accurate results.

#### Acceptance Criteria

1. THE `Media_Upload_Service` SHALL write the manifest file after every successful media upload for a book.
2. FOR ALL books with at least one `bookMedia` record, parsing the manifest JSON file from R2 then serialising the resulting book object then parsing again SHALL produce an equivalent object (round-trip property).
3. THE manifest JSON SHALL be parseable as a valid book record matching the `book` table schema without data loss.
