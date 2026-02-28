import * as XLSX from "xlsx";
/**
 * Safely reads a cell value as a trimmed string.
 * Handles both string and numeric cell types gracefully.
 */
export declare function getCellTrimmed(sheet: XLSX.WorkSheet, rowIndex: number, colIndex: number): string;
/**
 * Reads a cell value and parses it as a number (for price/currency fields).
 * Returns null if the cell is empty or not parseable.
 */
export declare function getCellAsNumber(sheet: XLSX.WorkSheet, rowIndex: number, colIndex: number): number | null;
/**
 * Builds a header-name → column-index map from the first row of a sheet.
 * Keys are normalized to lowercase and trimmed for case-insensitive lookup.
 */
export declare function buildHeaderIndex(sheet: XLSX.WorkSheet): Map<string, number>;
/**
 * Returns the usable row range of a sheet (skipping the header row).
 */
export declare function getDataRowRange(sheet: XLSX.WorkSheet): {
    startRow: number;
    endRow: number;
};
/**
 * Loads an Excel workbook from a file path.
 */
export declare function loadWorkbook(filePath: string): XLSX.WorkBook;
/**
 * Returns the first sheet of a workbook.
 */
export declare function getFirstSheet(workbook: XLSX.WorkBook): XLSX.WorkSheet;
