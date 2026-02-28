import type { Book, ExtractionResult } from "./types";
/**
 * Extracts all Book entries from the Excel file.
 *
 * Internally calls extractGender and extractPublisher first to build in-memory
 * lookup maps. Each book row is then enriched with the matching Gender and
 * Publisher objects by name.
 *
 * Deduplication: a book is considered a duplicate if another book already in
 * the result set shares the same ISBN or barcode AND the same title
 * (case-insensitive).
 *
 * Rows where the title cell is empty are silently skipped.
 *
 * @param filePath - Absolute or relative path to the .xlsx file
 * @returns ExtractionResult containing the Book array and total inserted count
 */
export declare function extractBook(filePath: string): ExtractionResult<Book>;
