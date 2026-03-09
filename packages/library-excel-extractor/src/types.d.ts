export interface Gender {
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
    genders: Gender[];
    publisher: Publisher | null;
}
export interface ExtractionResult<T> {
    items: T[];
    count: number;
}
