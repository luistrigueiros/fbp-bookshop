import ExcelJS from "exceljs";
import { DurableObject } from "cloudflare:workers";
import { ExportEnv, ExportBatch, ExportJobStatus } from "@/types";
import { getLibraryLogger, setupLogging, initDB, createRepositories } from "library-data-layer";

const logger = getLibraryLogger(["library", "excel-export", "assembler"]);

export class ExportAssembler extends DurableObject<ExportEnv> {
  constructor(state: DurableObjectState, env: ExportEnv) {
    super(state, env);
  }

  async addChunk(batch: ExportBatch) {
    await setupLogging({ environment: this.env.ENVIRONMENT });
    const { jobId, type, data, isLast } = batch;
    const doId = this.ctx.id.toString();

    logger.debug("addChunk: jobId={jobId}, type={type}, dataLength={dataLength}, isLast={isLast}, doId={doId}", {
      jobId,
      type,
      dataLength: data.length,
      isLast,
      doId
    });

    const index = (await this.ctx.storage.get<number>(`index:${type}`)) || 0;

    await this.ctx.storage.put(`chunk:${type}:${index}`, data);
    await this.ctx.storage.put(`index:${type}`, index + 1);

    if (isLast) {
      logger.info("Type {type} finished for DO {doId}", { type, doId });
      await this.ctx.storage.put(`last:${type}`, true);
    }

    const booksFinished = await this.ctx.storage.get<boolean>("last:books");
    const genresFinished = await this.ctx.storage.get<boolean>("last:genres");
    const publishersFinished = await this.ctx.storage.get<boolean>("last:publishers");

    if (booksFinished && genresFinished && publishersFinished) {
      logger.info("All types finished for DO {doId}. Finalizing workbook.", { doId });
      await this.finalize(jobId);
    }
  }

  private setupSheets(workbook: ExcelJS.Workbook) {
    const booksSheet = workbook.addWorksheet("Books");
    const genresSheet = workbook.addWorksheet("Genres");
    const publishersSheet = workbook.addWorksheet("Publishers");

    booksSheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Title", key: "title", width: 40 },
      { header: "Author", key: "author", width: 25 },
      { header: "ISBN", key: "isbn", width: 15 },
      { header: "Price", key: "price", width: 10 },
      { header: "Language", key: "language", width: 12 },
      { header: "Publisher", key: "publisher", width: 25 },
      { header: "Genres", key: "genreList", width: 30 },
      { header: "Stock", key: "stock", width: 10 },
      { header: "Sold", key: "sold", width: 10 },
      { header: "Shelf", key: "shelf", width: 15 },
    ];

    genresSheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Name", key: "name", width: 40 },
    ];

    publishersSheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Name", key: "name", width: 40 },
    ];

    return { booksSheet, genresSheet, publishersSheet };
  }

  private async populateGenres(genresSheet: ExcelJS.Worksheet, genreRows: Map<number, number>) {
    const genreIndexCount = (await this.ctx.storage.get<number>("index:genres")) || 0;
    let currentRow = 2;
    for (let i = 0; i < genreIndexCount; i++) {
      const chunk = await this.ctx.storage.get<any[]>(`chunk:genres:${i}`);
      if (chunk) {
        chunk.forEach(item => {
          genresSheet.addRow(item);
          genreRows.set(item.id, currentRow++);
        });
      }
    }
  }

  private async populatePublishers(publishersSheet: ExcelJS.Worksheet, publisherRows: Map<number, number>) {
    const pubIndexCount = (await this.ctx.storage.get<number>("index:publishers")) || 0;
    let currentRow = 2;
    for (let i = 0; i < pubIndexCount; i++) {
      const chunk = await this.ctx.storage.get<any[]>(`chunk:publishers:${i}`);
      if (chunk) {
        chunk.forEach(item => {
          publishersSheet.addRow(item);
          publisherRows.set(item.id, currentRow++);
        });
      }
    }
  }

  private async populateBooks(booksSheet: ExcelJS.Worksheet, genreRows: Map<number, number>, publisherRows: Map<number, number>) {
    const bookIndexCount = (await this.ctx.storage.get<number>("index:books")) || 0;
    for (let i = 0; i < bookIndexCount; i++) {
      const chunk = await this.ctx.storage.get<any[]>(`chunk:books:${i}`);
      if (chunk) {
        chunk.forEach(item => {
          const genres = (item.bookGenres as any[] | undefined)
            ?.map((bg) => bg.genre?.name)
            .filter(Boolean)
            .join(", ") || "";

          const rowData = {
            id: item.id,
            title: item.title,
            author: item.author,
            isbn: item.isbn,
            price: item.price,
            language: item.language,
            publisher: item.publisher?.name || "",
            genreList: genres,
            stock: item.stock?.numberOfCopies ?? 0,
            sold: item.stock?.numberOfCopiesSold ?? 0,
            shelf: item.stock?.bookshelf || ""
          };

          const row = booksSheet.addRow(rowData);

          if (item.publisherId && publisherRows.has(item.publisherId)) {
            const destRow = publisherRows.get(item.publisherId);
            row.getCell("publisher").value = {
              text: item.publisher?.name || "Publisher",
              hyperlink: `#Publishers!A${destRow}`
            };
          }

          if (item.bookGenres && item.bookGenres.length > 0) {
            const firstGenreId = item.bookGenres[0].genreId;
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
  }

  async finalize(jobId: string) {
    const doId = this.ctx.id.toString();
    try {
      logger.info("Finalizing workbook for jobId {jobId} (DO {doId})", { jobId, doId });
      const workbook = new ExcelJS.Workbook();
      const { booksSheet, genresSheet, publishersSheet } = this.setupSheets(workbook);

      const genreRows = new Map<number, number>();
      const publisherRows = new Map<number, number>();

      await this.populateGenres(genresSheet, genreRows);
      await this.populatePublishers(publishersSheet, publisherRows);
      await this.populateBooks(booksSheet, genreRows, publisherRows);

      logger.info("Writing workbook to buffer for DO {doId}", { doId });
      const buffer = await workbook.xlsx.writeBuffer();
      const uint8Array = new Uint8Array(buffer);

      logger.info("Uploading workbook to R2: exports/{jobId}.xlsx", { jobId });
      await this.env.EXPORT_BUCKET.put(`exports/${jobId}.xlsx`, uint8Array, {
        httpMetadata: { contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }
      });

      await this.ctx.storage.put("status", ExportJobStatus.COMPLETED);
      
      const db = initDB(this.env.DB);
      const { exports } = createRepositories(db);
      await exports.update(jobId, {
        status: ExportJobStatus.COMPLETED,
        progress: 100,
        url: `/download/${jobId}`,
        errorMessage: null
      });
      logger.info("Marked jobId {jobId} as COMPLETED in DB", { jobId });
    } catch (error) {
      logger.error("Error finalizing workbook for jobId {jobId}: {error}", { jobId, error });
      const db = initDB(this.env.DB);
      const { exports } = createRepositories(db);
      await exports.update(jobId, {
        status: ExportJobStatus.FAILED,
        errorMessage: error instanceof Error ? error.message : String(error)
      });
      await this.ctx.storage.put("status", ExportJobStatus.FAILED);
      throw error;
    }
  }

  async getStatus() {
    return await this.ctx.storage.get("status");
  }
}
