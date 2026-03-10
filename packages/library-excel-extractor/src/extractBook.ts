import * as XLSX from "xlsx";
import type { Book, Genre, Publisher, ExtractionResult } from "./types";
import { extractGenre } from "./extractGenre";
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
  GENRE: "género",
  PUBLISHER: "editora",
} as const;

/**
 * Builds a lookup map from lowercase name → entity, used internally to
 * match genre/publisher strings from book rows to their canonical objects.
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
 * Internally calls extractGenre and extractPublisher first to build in-memory
 * lookup maps. Each book row is then enriched with the matching Genre and
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
  // ── 1. Pre-load genres and publishers into memory ──────────────────────
  const { items: genres, errors: genreErrors } = extractGenre(input);
  const { items: publishers, errors: publisherErrors } = extractPublisher(input);

  const genreByName = buildLookupMap(genres);
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
    genre: headerMap.get(COLUMNS.GENRE),
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
    ...genreErrors,
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
      const genreCellValue = col.genre !== undefined
        ? getCellTrimmed(sheet, row, col.genre)
        : "";
      const publisherName = col.publisher !== undefined
        ? getCellTrimmed(sheet, row, col.publisher)
        : "";

      const genreNames = genreCellValue
        ? genreCellValue.split("/").map((s) => s.trim()).filter(Boolean)
        : [];

      const genres: Genre[] = genreNames
        .map((name) => genreByName.get(name.toLowerCase()) ?? null)
        .filter((g): g is Genre => g !== null);

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
        genres,
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

  return { items: books, count: books.length, errors };
}
