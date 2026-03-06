import { describe, it, expect } from "bun:test";
import * as XLSX from "xlsx";
import { extractBook } from "../src/extractBook";

describe("Error Reporting", () => {
  it("collects errors for rows that fail processing without stopping", () => {
    // Create a workbook with some valid and some "invalid" data
    // We'll simulate an error by making getCellAsNumber fail or something similar
    // Actually, our current implementation is quite robust, but we can't easily force a "crash" 
    // unless we pass something that makes the cell access throw.
    
    const wb = XLSX.utils.book_new();
    const data = [
      ["nome", "autor", "isbn", "preço", "género", "editora"],
      ["Valid Book 1", "Author 1", "1234567890", 10.5, "Fiction", "Publisher A"],
      ["Valid Book 2", "Author 2", "0987654321", "invalid-price", "Non-Fiction", "Publisher B"],
      ["", "No Title", "", 5.0, "Fiction", "Publisher A"],
      ["Valid Book 3", "Author 3", "1122334455", 15.0, "Science", "Publisher C"],
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    
    // Convert to buffer
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    
    const result = extractBook(buf);
    
    expect(result.items.length).toBe(2);
    expect(result.items[0].title).toBe("Valid Book 1");
    expect(result.items[1].title).toBe("Valid Book 3");
    
    expect(result.errors.length).toBe(1);
    expect(result.errors[0].row).toBe(2);
    expect(result.errors[0].message).toContain('Invalid numeric value: "invalid-price"');
  });
});
