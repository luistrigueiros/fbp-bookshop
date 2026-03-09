import * as XLSX from "xlsx";
import type { Book, Gender, Publisher, ExtractionResult } from "./types";
import { extractGender } from "./extractGender";
import { extractPublisher } from "./extractPublisher";
import {
  buildHeaderIndex,
  getCellTrimmed,
  getCellAsNumber,
  getDataRowRange,
  getFirstSheet,
  loadWorkbook,
} from "./excelUtils";

/**
 * Column names expected in the header row (Portuguese, as per the source spreadsheet).
 */
const COLUMNS = {
  TITLE: "nome",
  AUTHOR: "autor",
  ISBN: "isbn",
  BARCODE: "codigo barras",
  PRICE: "preço",
  LANGUAGE: "lingua",
  GENDER: "género",
  PUBLISHER: "editora",
} as const;

/**
 * Builds a lookup map from lowercase name → entity, used internally to
 * match gender/publisher strings from book rows to their canonical objects.
 */
function buildLookupMap<T extends { name: string }>(
  items: T[]
): Map<string, T> {
  const map = new Map<string, T>();
  for (const item of items) {
    map.set(item.name.toLowerCase(), item);
  }
  return map;
}

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
 * @param input - Absolute or relative path to the .xlsx file, or its content as a buffer
 * @returns ExtractionResult containing the Book array and total inserted count
 */
export function extractBook(
  input: string | ArrayBuffer | Buffer
): ExtractionResult<Book> {
  // ── 1. Pre-load genders and publishers into memory ──────────────────────
  const { items: genders, errors: genderErrors } = extractGender(input);
  const { items: publishers, errors: publisherErrors } = extractPublisher(input);

  const genderByName = buildLookupMap(genders);
  const publisherByName = buildLookupMap(publishers);

  // ── 2. Open workbook and map columns ────────────────────────────────────
  const workbook: XLSX.WorkBook = loadWorkbook(input);
  const sheet: XLSX.WorkSheet = getFirstSheet(workbook);
  const headerMap = buildHeaderIndex(sheet);

  // Resolve each column index; undefined means the column is absent
  const col = {
    title: headerMap.get(COLUMNS.TITLE),
    author: headerMap.get(COLUMNS.AUTHOR),
    isbn: headerMap.get(COLUMNS.ISBN),
    barcode: headerMap.get(COLUMNS.BARCODE),
    price: headerMap.get(COLUMNS.PRICE),
    language: headerMap.get(COLUMNS.LANGUAGE),
    gender: headerMap.get(COLUMNS.GENDER),
    publisher: headerMap.get(COLUMNS.PUBLISHER),
  };

  if (col.title === undefined) {
    throw new Error(
      '[extractBook] Required column "nome" (title) not found in header row.'
    );
  }

  // ── 3. Iterate rows ──────────────────────────────────────────────────────
  const { startRow, endRow } = getDataRowRange(sheet);
  const books: Book[] = [];
  const errors: { row: number; message: string }[] = [
    ...genderErrors,
    ...publisherErrors,
  ];

  // Tracks (normalizedTitle + isbn) and (normalizedTitle + barcode) for dedup
  const seenIsbn = new Map<string, true>();
  const seenBarcode = new Map<string, true>();

  for (let row = startRow; row <= endRow; row++) {
    try {
      const title = col.title !== undefined
        ? getCellTrimmed(sheet, row, col.title)
        : "";

      // Skip rows with no title
      if (!title) continue;

      const titleLower = title.toLowerCase();

      const isbn = col.isbn !== undefined
        ? getCellTrimmed(sheet, row, col.isbn) || null
        : null;

      const barcode = col.barcode !== undefined
        ? getCellTrimmed(sheet, row, col.barcode) || null
        : null;

      // ── Deduplication check ────────────────────────────────────────────────
      if (isbn) {
        const key = `${titleLower}|${isbn}`;
        if (seenIsbn.has(key)) continue;
        seenIsbn.set(key, true);
      }

      if (barcode) {
        const key = `${titleLower}|${barcode}`;
        if (seenBarcode.has(key)) continue;
        seenBarcode.set(key, true);
      }

      // ── Map related entities by name ──────────────────────────────────────
      const genderCellValue = col.gender !== undefined
        ? getCellTrimmed(sheet, row, col.gender)
        : "";
      const publisherName = col.publisher !== undefined
        ? getCellTrimmed(sheet, row, col.publisher)
        : "";

      const genderNames = genderCellValue
        ? genderCellValue.split("/").map((s) => s.trim()).filter(Boolean)
        : [];

      const genders: Gender[] = genderNames
        .map((name) => genderByName.get(name.toLowerCase()) ?? null)
        .filter((g): g is Gender => g !== null);

      const publisher: Publisher | null = publisherName
        ? (publisherByName.get(publisherName.toLowerCase()) ?? null)
        : null;

      // ── Build book object ─────────────────────────────────────────────────
      const book: Book = {
        title,
        author: col.author !== undefined
          ? getCellTrimmed(sheet, row, col.author) || null
          : null,
        isbn,
        barcode,
        price: col.price !== undefined
          ? getCellAsNumber(sheet, row, col.price)
          : null,
        language: col.language !== undefined
          ? getCellTrimmed(sheet, row, col.language) || null
          : null,
        genders,
        publisher,
      };

      books.push(book);
    } catch (e: any) {
      errors.push({
        row,
        message: e.message || String(e),
      });
    }
  }

  console.log(`[IMPORT] Extracted ${books.length} books, ${errors.length} errors`);

  return { items: books, count: books.length, errors };
}
