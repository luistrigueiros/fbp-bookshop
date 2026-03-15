import type { R2Bucket } from '@cloudflare/workers-types';
import type { Book } from 'library-data-layer';
import { buildManifestKey } from './r2Keys';

/**
 * Write a book manifest JSON file to R2.
 * Serialises the core book fields needed for database reconstruction.
 */
export async function writeManifest(
  r2: R2Bucket,
  bookId: number,
  bookRecord: Book,
): Promise<void> {
  const json = JSON.stringify({
    id: bookRecord.id,
    title: bookRecord.title,
    author: bookRecord.author,
    isbn: bookRecord.isbn,
    barcode: bookRecord.barcode,
    language: bookRecord.language,
    publisherId: bookRecord.publisherId,
  });

  await r2.put(buildManifestKey(bookId), json, {
    httpMetadata: { contentType: 'application/json' },
  });
}

/**
 * Delete the book manifest JSON file from R2.
 */
export async function deleteManifest(r2: R2Bucket, bookId: number): Promise<void> {
  await r2.delete(buildManifestKey(bookId));
}
