import type { R2Bucket } from '@cloudflare/workers-types';
import type { Book } from 'library-data-layer';
import { buildManifestKey } from './r2Keys';

/**
 * Write a book manifest JSON file to R2.
 * Serialises the core book fields needed for database reconstruction.
 * The manifest is stored under the book's mediaFolderId so the R2 folder
 * can be linked back to the book record even if the database is rebuilt.
 */
export async function writeManifest(
  r2: R2Bucket,
  bookRecord: Book,
): Promise<void> {
  const json = JSON.stringify({
    id: bookRecord.id,
    mediaFolderId: bookRecord.mediaFolderId,
    title: bookRecord.title,
    author: bookRecord.author,
    isbn: bookRecord.isbn,
    barcode: bookRecord.barcode,
    language: bookRecord.language,
    publisherId: bookRecord.publisherId,
  });

  await r2.put(buildManifestKey(bookRecord.mediaFolderId), json, {
    httpMetadata: { contentType: 'application/json' },
  });
}

/**
 * Delete the book manifest JSON file from R2.
 */
export async function deleteManifest(r2: R2Bucket, mediaFolderId: string): Promise<void> {
  await r2.delete(buildManifestKey(mediaFolderId));
}
