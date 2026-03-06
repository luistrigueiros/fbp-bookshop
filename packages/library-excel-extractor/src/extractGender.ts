import * as XLSX from "xlsx";
import type { Gender, ExtractionResult } from "./types";
import {
  buildHeaderIndex,
  getCellTrimmed,
  getDataRowRange,
  getFirstSheet,
  loadWorkbook,
} from "./excelUtils";

/**
 * Extracts all unique, deduplicated Gender entries from the Excel file.
 *
 * Reads the first sheet, locates the "género" column by name (case-insensitive),
 * then iterates every data row — skipping empty cells — and collects unique names.
 * Each Gender receives an auto-incremented numeric ID.
 *
 * @param input - Absolute or relative path to the .xlsx file, or its content as a buffer
 * @returns ExtractionResult containing the deduplicated Gender array and total count
 * @throws Error if the "género" column is not found in the header row
 */
export function extractGender(
  input: string | ArrayBuffer | Buffer
): ExtractionResult<Gender> {
  const workbook: XLSX.WorkBook = loadWorkbook(input);
  const sheet: XLSX.WorkSheet = getFirstSheet(workbook);

  const headerMap = buildHeaderIndex(sheet);
  const genreColIndex = headerMap.get("género");

  if (genreColIndex === undefined) {
    throw new Error(
      '[extractGender] Required column "género" not found in header row.'
    );
  }

  const { startRow, endRow } = getDataRowRange(sheet);
  const seen = new Map<string, Gender>();
  const errors: { row: number; message: string }[] = [];
  let nextId = 1;

  for (let row = startRow; row <= endRow; row++) {
    try {
      const name = getCellTrimmed(sheet, row, genreColIndex);
      if (!name) continue;

      const normalized = name.toLowerCase();
      if (!seen.has(normalized)) {
        seen.set(normalized, { id: nextId++, name });
      }
    } catch (e: any) {
      errors.push({
        row,
        message: e.message || String(e),
      });
    }
  }

  const items = Array.from(seen.values());
  console.log(`[IMPORT] Extracted ${items.length} genders, ${errors.length} errors`);

  return { items, count: items.length, errors };
}
