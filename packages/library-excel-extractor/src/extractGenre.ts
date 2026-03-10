import * as XLSX from "xlsx";
import type { Genre, ExtractionResult } from "./types";
import {
  buildHeaderIndex,
  getCellTrimmed,
  getDataRowRange,
  getFirstSheet,
  loadWorkbook,
} from "./excelUtils";

/**
 * Extracts all unique, deduplicated Genre entries from the Excel file.
 *
 * Reads the first sheet, locates the "género" column by name (case-insensitive),
 * then iterates every data row — skipping empty cells — and collects unique names.
 * Each Genre receives an auto-incremented numeric ID.
 *
 * @param input - Absolute or relative path to the .xlsx file, or its content as a buffer
 * @returns ExtractionResult containing the deduplicated Genre array and total count
 * @throws Error if the "género" column is not found in the header row
 */
export function extractGenre(
  input: string | ArrayBuffer | Buffer
): ExtractionResult<Genre> {
  const workbook: XLSX.WorkBook = loadWorkbook(input);
  const sheet: XLSX.WorkSheet = getFirstSheet(workbook);

  const headerMap = buildHeaderIndex(sheet);
  const genreColIndex = headerMap.get("género");

  if (genreColIndex === undefined) {
    throw new Error(
      '[extractGenre] Required column "género" not found in header row.'
    );
  }

  const { startRow, endRow } = getDataRowRange(sheet);
  const seen = new Map<string, Genre>();
  const errors: { row: number; message: string }[] = [];
  let nextId = 1;

  for (let row = startRow; row <= endRow; row++) {
    try {
      const cellValue = getCellTrimmed(sheet, row, genreColIndex);
      if (!cellValue) continue;

      const names = cellValue.split("/").map((s) => s.trim()).filter(Boolean);
      for (const name of names) {
        const normalized = name.toLowerCase();
        if (!seen.has(normalized)) {
          seen.set(normalized, { id: nextId++, name });
        }
      }
    } catch (e: any) {
      errors.push({
        row,
        message: e.message || String(e),
      });
    }
  }

  const items = Array.from(seen.values());
  return { items, count: items.length, errors };
}
