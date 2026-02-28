import type { Gender, ExtractionResult } from "./types";
/**
 * Extracts all unique, deduplicated Gender entries from the Excel file.
 *
 * Reads the first sheet, locates the "género" column by name (case-insensitive),
 * then iterates every data row — skipping empty cells — and collects unique names.
 * Each Gender receives an auto-incremented numeric ID.
 *
 * @param filePath - Absolute or relative path to the .xlsx file
 * @returns ExtractionResult containing the deduplicated Gender array and total count
 * @throws Error if the "género" column is not found in the header row
 */
export declare function extractGender(filePath: string): ExtractionResult<Gender>;
