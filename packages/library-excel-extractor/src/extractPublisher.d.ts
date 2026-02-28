import type { Publisher, ExtractionResult } from "./types";
/**
 * Extracts all unique, deduplicated Publisher entries from the Excel file.
 *
 * Reads the first sheet, locates the "editora" column by name (case-insensitive),
 * then iterates every data row — skipping empty cells — and collects unique names.
 * Each Publisher receives an auto-incremented numeric ID.
 *
 * @param filePath - Absolute or relative path to the .xlsx file
 * @returns ExtractionResult containing the deduplicated Publisher array and total count
 * @throws Error if the "editora" column is not found in the header row
 */
export declare function extractPublisher(filePath: string): ExtractionResult<Publisher>;
