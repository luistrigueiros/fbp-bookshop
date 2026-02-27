import * as XLSX from "xlsx";
import type { Publisher, ExtractionResult } from "./types";
import {
  buildHeaderIndex,
  getCellTrimmed,
  getDataRowRange,
  getFirstSheet,
  loadWorkbook,
} from "./excelUtils";

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
export function extractPublisher(filePath: string): ExtractionResult<Publisher> {
  const workbook: XLSX.WorkBook = loadWorkbook(filePath);
  const sheet: XLSX.WorkSheet = getFirstSheet(workbook);

  const headerMap = buildHeaderIndex(sheet);
  const editoraColIndex = headerMap.get("editora");

  if (editoraColIndex === undefined) {
    throw new Error(
      '[extractPublisher] Required column "editora" not found in header row.'
    );
  }

  const { startRow, endRow } = getDataRowRange(sheet);
  const seen = new Map<string, Publisher>();
  let nextId = 1;

  for (let row = startRow; row <= endRow; row++) {
    const name = getCellTrimmed(sheet, row, editoraColIndex);
    if (!name) continue;

    const normalized = name.toLowerCase();
    if (!seen.has(normalized)) {
      seen.set(normalized, { id: nextId++, name });
    }
  }

  const items = Array.from(seen.values());
  console.log(`[IMPORT] Extracted ${items.length} publishers`);

  return { items, count: items.length };
}
