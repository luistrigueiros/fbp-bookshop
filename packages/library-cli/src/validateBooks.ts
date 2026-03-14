import { Book } from "library-excel-extractor";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateBooks(books: Book[]): ValidationResult {
  const errors: string[] = [];

  books.forEach((book, index) => {
    const rowIndex = index + 1; // Assuming 1-based index for easier identification

    if (!book.title || book.title.trim() === "") {
      errors.push(`Row ${rowIndex}: Title is required.`);
    }

    if (book.numberOfCopies !== null && book.numberOfCopies < 0) {
      errors.push(`Row ${rowIndex}: Number of copies cannot be negative.`);
    }

    if (book.numberOfSoldCopies !== null && book.numberOfSoldCopies < 0) {
      errors.push(`Row ${rowIndex}: Number of sold copies cannot be negative.`);
    }

    if (
      book.numberOfCopies !== null &&
      book.numberOfSoldCopies !== null &&
      book.numberOfSoldCopies > book.numberOfCopies
    ) {
      errors.push(
        `Row ${rowIndex}: Number of sold copies (${book.numberOfSoldCopies}) cannot exceed number of copies (${book.numberOfCopies}).`
      );
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}
