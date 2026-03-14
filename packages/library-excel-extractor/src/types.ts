export interface Genre {
  id: number;
  name: string;
}

export interface Publisher {
  id: number;
  name: string;
}

export interface Book {
  title: string;
  author: string | null;
  isbn: string | null;
  barcode: string | null;
  price: number | null;
  language: string | null;
  genres: Genre[];
  publisher: Publisher | null;
  bookshelf: string | null;
  numberOfCopies: number | null;
  numberOfSoldCopies: number | null;
}

export interface ExtractionError {
  row: number;
  message: string;
}

export interface ExtractionResult<T> {
  items: T[];
  count: number;
  errors: ExtractionError[];
}
