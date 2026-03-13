import ExcelJS from "exceljs";
import {ExportBatch} from "@/types";

export class ExportAssembler {
  ctx: DurableObjectState;
  env: Env;
  constructor(state: DurableObjectState, env: Env) {
    this.ctx = state;
    this.env = env;
  }

  async addChunk(batch: ExportBatch) {
    const { type, data, isLast } = batch;
    
    // Get current index for this type
    const index = (await this.ctx.storage.get<number>(`index:${type}`)) || 0;
    
    // Store data in chunks to avoid DO storage limits per key (128KB)
    // Actually, DO keys can be up to 10KB, values up to 128KB.
    // We'll store each batch as a separate key.
    await this.ctx.storage.put(`chunk:${type}:${index}`, data);
    await this.ctx.storage.put(`index:${type}`, index + 1);
    
    if (isLast) {
      await this.ctx.storage.put(`last:${type}`, true);
    }
    
    // Check if all types are finished
    const booksFinished = await this.ctx.storage.get<boolean>("last:books");
    const genresFinished = await this.ctx.storage.get<boolean>("last:genres");
    const publishersFinished = await this.ctx.storage.get<boolean>("last:publishers");
    
    if (booksFinished && genresFinished && publishersFinished) {
      await this.finalize();
    }
  }

  async finalize() {
    const workbook = new ExcelJS.Workbook();
    
    // Add Sheets
    const booksSheet = workbook.addWorksheet("Books");
    const genresSheet = workbook.addWorksheet("Genres");
    const publishersSheet = workbook.addWorksheet("Publishers");
    
    // Define Columns
    booksSheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Title", key: "title", width: 40 },
      { header: "Author", key: "author", width: 25 },
      { header: "ISBN", key: "isbn", width: 15 },
      { header: "Price", key: "price", width: 10 },
      { header: "Language", key: "language", width: 12 },
      { header: "Publisher", key: "publisher", width: 25 },
      { header: "Genres", key: "genreList", width: 30 },
    ];
    
    genresSheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Name", key: "name", width: 40 },
    ];
    
    publishersSheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Name", key: "name", width: 40 },
    ];

    // Maps to store row indices for linking
    const genreRows = new Map<number, number>();
    const publisherRows = new Map<number, number>();

    // 1. Populate Genres
    const genreIndexCount = (await this.ctx.storage.get<number>("index:genres")) || 0;
    let currentRow = 2; // Header is row 1
    for (let i = 0; i < genreIndexCount; i++) {
      const chunk = await this.ctx.storage.get<unknown[]>(`chunk:genres:${i}`) as { id: number }[];
      if (chunk) {
        chunk.forEach(item => {
          genresSheet.addRow(item);
          genreRows.set(item.id, currentRow++);
        });
      }
    }

    // 2. Populate Publishers
    const pubIndexCount = (await this.ctx.storage.get<number>("index:publishers")) || 0;
    currentRow = 2;
    for (let i = 0; i < pubIndexCount; i++) {
      const chunk = await this.ctx.storage.get<unknown[]>(`chunk:publishers:${i}`) as { id: number }[];
      if (chunk) {
        chunk.forEach(item => {
          publishersSheet.addRow(item);
          publisherRows.set(item.id, currentRow++);
        });
      }
    }

    // 3. Populate Books with links
    const bookIndexCount = (await this.ctx.storage.get<number>("index:books")) || 0;
    for (let i = 0; i < bookIndexCount; i++) {
      const chunk = await this.ctx.storage.get<unknown[]>(`chunk:books:${i}`) as Record<string, unknown>[];
      if (chunk) {
        chunk.forEach(item => {
          // Flatten genres list
          const genres = (item.bookGenres as { genre?: { name: string } }[] | undefined)?.map((bg) => bg.genre?.name).filter(Boolean).join(", ") || "";
          
          const rowData = {
            id: item.id as number,
            title: item.title as string,
            author: item.author as string,
            isbn: item.isbn as string,
            price: item.price as string,
            language: item.language as string,
            publisher: (item.publisher as { name: string } | undefined)?.name || "",
            genreList: genres
          };
          
          const row = booksSheet.addRow(rowData);

          // Add Publisher Link
          if (item.publisherId && publisherRows.has(item.publisherId as number)) {
            const destRow = publisherRows.get(item.publisherId as number);
            row.getCell("publisher").value = {
              text: (item.publisher as { name: string } | undefined)?.name || "Publisher",
              hyperlink: `#Publishers!A${destRow}`
            };
          }

          // Add Genre Link (linking to the first genre found)
          if (item.bookGenres && (item.bookGenres as { genreId: number }[]).length > 0) {
            const firstGenreId = (item.bookGenres as { genreId: number }[])[0].genreId;
            if (genreRows.has(firstGenreId)) {
              const destRow = genreRows.get(firstGenreId);
              row.getCell("genreList").value = {
                text: genres,
                hyperlink: `#Genres!A${destRow}`
              };
            }
          }
        });
      }
    }

    // Export to R2
    const buffer = await workbook.xlsx.writeBuffer();
    // const jobId = Math.random().toString(36).substring(7); // Simplified for now
    // In finalize, we don't have the original jobId easily unless we store it.
    // Actually, DO ID can be used as key.
    const doId = this.ctx.id.toString();
    
    await this.env.EXPORT_BUCKET.put(`exports/${doId}.xlsx`, buffer, {
      httpMetadata: { contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }
    });
    
    await this.ctx.storage.put("status", "completed");
  }

  async getStatus() {
    return await this.ctx.storage.get("status");
  }
}

export interface Env {
  DB: D1Database;
  EXPORT_QUEUE: Queue;
  EXPORT_ASSEMBLER: DurableObjectNamespace;
  EXPORT_BUCKET: R2Bucket;
}
