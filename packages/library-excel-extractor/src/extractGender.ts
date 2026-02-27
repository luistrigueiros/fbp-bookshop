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
 * @param filePath - Absolute or relative path to the .xlsx file
 * @returns ExtractionResult containing the deduplicated Gender array and total count
 * @throws Error if the "género" column is not found in the header row
 */
export function extractGender(filePath: string): ExtractionResult<Gender> {
  const workbook: XLSX.WorkBook = loadWorkbook(filePath);
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
  let nextId = 1;

  for (let row = startRow; row <= endRow; row++) {
    const name = getCellTrimmed(sheet, row, genreColIndex);
    if (!name) continue;

    const normalized = name.toLowerCase();
    if (!seen.has(normalized)) {
      seen.set(normalized, { id: nextId++, name });
    }
  }

  const items = Array.from(seen.values());
  console.log(`[IMPORT] Extracted ${items.length} genders`);

  return { items, count: items.length };
}
