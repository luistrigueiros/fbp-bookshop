/**
 * Sanitise a filename by replacing any character not in [a-zA-Z0-9._-] with '_'.
 */
export function sanitiseFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

/**
 * Build the R2 key for a media file.
 * Format: books/{mediaFolderId}/{category}/{timestamp}-{sanitisedFilename}
 */
export function buildMediaKey(
  mediaFolderId: string,
  category: string,
  timestamp: number,
  filename: string,
): string {
  const sanitised = sanitiseFilename(filename);
  return `books/${mediaFolderId}/${category}/${timestamp}-${sanitised}`;
}

/**
 * Build the R2 key for a thumbnail file.
 * Format: books/{mediaFolderId}/{category}/{timestamp}-thumb-{sanitisedFilename}
 */
export function buildThumbnailKey(
  mediaFolderId: string,
  category: string,
  timestamp: number,
  filename: string,
): string {
  const sanitised = sanitiseFilename(filename);
  return `books/${mediaFolderId}/${category}/${timestamp}-thumb-${sanitised}`;
}

/**
 * Build the R2 key for a book's manifest file.
 * Format: books/{mediaFolderId}/manifest.json
 */
export function buildManifestKey(mediaFolderId: string): string {
  return `books/${mediaFolderId}/manifest.json`;
}
