import * as XLSX from "xlsx";

/**
 * Safely reads a cell value as a trimmed string.
 * Handles both string and numeric cell types gracefully.
 */
export function getCellTrimmed(
  sheet: XLSX.WorkSheet,
  rowIndex: number,
  colIndex: number
): string {
  const cellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });
  const cell: XLSX.CellObject | undefined = sheet[cellAddress];

  if (!cell || cell.v === null || cell.v === undefined) {
    return "";
  }

  if (cell.t === "n") {
    return String(cell.v).trim();
  }

  return String(cell.v).trim();
}

/**
 * Reads a cell value and parses it as a number (for price/currency fields).
 * Returns null if the cell is empty or not parseable.
 */
export function getCellAsNumber(
  sheet: XLSX.WorkSheet,
  rowIndex: number,
  colIndex: number
): number | null {
  const cellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });
  const cell: XLSX.CellObject | undefined = sheet[cellAddress];

  if (!cell || cell.v === null || cell.v === undefined) {
    return null;
  }

  const parsed = parseFloat(String(cell.v));
  return isNaN(parsed) ? null : parsed;
}

/**
 * Builds a header-name → column-index map from the first row of a sheet.
 * Keys are normalized to lowercase and trimmed for case-insensitive lookup.
 */
export function buildHeaderIndex(sheet: XLSX.WorkSheet): Map<string, number> {
  const range = XLSX.utils.decode_range(sheet["!ref"] ?? "A1");
  const headerMap = new Map<string, number>();

  for (let col = range.s.c; col <= range.e.c; col++) {
    const value = getCellTrimmed(sheet, range.s.r, col);
    if (value) {
      // Normalize: lowercase + collapse multiple spaces
      const normalized = value.toLowerCase().replace(/\s+/g, " ").trim();
      headerMap.set(normalized, col);
    }
  }

  return headerMap;
}

/**
 * Returns the usable row range of a sheet (skipping the header row).
 */
export function getDataRowRange(sheet: XLSX.WorkSheet): {
  startRow: number;
  endRow: number;
} {
  const range = XLSX.utils.decode_range(sheet["!ref"] ?? "A1");
  return {
    startRow: range.s.r + 1, // skip header
    endRow: range.e.r,
  };
}

/**
 * Loads an Excel workbook from a file path.
 */
export function loadWorkbook(filePath: string): XLSX.WorkBook {
  return XLSX.readFile(filePath);
}

/**
 * Returns the first sheet of a workbook.
 */
export function getFirstSheet(workbook: XLSX.WorkBook): XLSX.WorkSheet {
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error("Workbook contains no sheets.");
  }
  return workbook.Sheets[sheetName];
}
