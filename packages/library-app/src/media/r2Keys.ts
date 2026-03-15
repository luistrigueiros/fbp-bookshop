/**
 * Sanitise a filename by replacing any character not in [a-zA-Z0-9._-] with '_'.
 */
export function sanitiseFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

/**
 * Build the R2 key for a media file.
 * Format: books/{bookId}/{category}/{timestamp}-{sanitisedFilename}
 */
export function buildMediaKey(
  bookId: number,
  category: string,
  timestamp: number,
  filename: string,
): string {
  const sanitised = sanitiseFilename(filename);
  return `books/${bookId}/${category}/${timestamp}-${sanitised}`;
}

/**
 * Build the R2 key for a thumbnail file.
 * Format: books/{bookId}/{category}/{timestamp}-thumb-{sanitisedFilename}
 */
export function buildThumbnailKey(
  bookId: number,
  category: string,
  timestamp: number,
  filename: string,
): string {
  const sanitised = sanitiseFilename(filename);
  return `books/${bookId}/${category}/${timestamp}-thumb-${sanitised}`;
}

/**
 * Build the R2 key for a book's manifest file.
 * Format: books/{bookId}/manifest.json
 */
export function buildManifestKey(bookId: number): string {
  return `books/${bookId}/manifest.json`;
}
