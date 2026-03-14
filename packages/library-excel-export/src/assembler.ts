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

  async finalize(jobId: string) {
    const doId = this.ctx.id.toString();
    try {
      logger.info("Finalizing workbook for jobId {jobId} (DO {doId})", { jobId, doId });
      const workbook = new ExcelJS.Workbook();

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
    ];

    genresSheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Name", key: "name", width: 40 },
    ];

    publishersSheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Name", key: "name", width: 40 },
    ];

    const genreRows = new Map<number, number>();
    const publisherRows = new Map<number, number>();

    const genreIndexCount = (await this.ctx.storage.get<number>("index:genres")) || 0;
    logger.debug("Populating Genres: {count} chunks", { count: genreIndexCount });
    let currentRow = 2;
    for (let i = 0; i < genreIndexCount; i++) {
      const chunk = await this.ctx.storage.get<unknown[]>(`chunk:genres:${i}`) as { id: number }[];
      if (chunk) {
        chunk.forEach(item => {
          genresSheet.addRow(item);
          genreRows.set(item.id, currentRow++);
        });
      }
    }

    const pubIndexCount = (await this.ctx.storage.get<number>("index:publishers")) || 0;
    logger.debug("Populating Publishers: {count} chunks", { count: pubIndexCount });
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

    const bookIndexCount = (await this.ctx.storage.get<number>("index:books")) || 0;
    logger.debug("Populating Books: {count} chunks", { count: bookIndexCount });
    for (let i = 0; i < bookIndexCount; i++) {
      const chunk = await this.ctx.storage.get<unknown[]>(`chunk:books:${i}`) as Record<string, unknown>[];
      if (chunk) {
        chunk.forEach(item => {
          const genres = (item.bookGenres as { genre?: { name: string } }[] | undefined)
            ?.map((bg) => bg.genre?.name)
            .filter(Boolean)
            .join(", ") || "";

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

          if (item.publisherId && publisherRows.has(item.publisherId as number)) {
            const destRow = publisherRows.get(item.publisherId as number);
            row.getCell("publisher").value = {
              text: (item.publisher as { name: string } | undefined)?.name || "Publisher",
              hyperlink: `#Publishers!A${destRow}`
            };
          }

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

    logger.info("Writing workbook to buffer for DO {doId}", { doId });
    const buffer = await workbook.xlsx.writeBuffer();
    const uint8Array = new Uint8Array(buffer);

    logger.info("Uploading workbook to R2: exports/{jobId}.xlsx", { jobId });
    await this.env.EXPORT_BUCKET.put(`exports/${jobId}.xlsx`, uint8Array, {
      httpMetadata: { contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }
    });

    logger.info("Export completed successfully for jobId {jobId}", { jobId });
    await this.ctx.storage.put("status", ExportJobStatus.COMPLETED);
    
    // Update job record with URL
    const db = initDB(this.env.DB);
    const { exports } = createRepositories(db);
    await exports.update(jobId, {
      status: ExportJobStatus.COMPLETED,
      progress: 100,
      url: `/download/${jobId}`,
      errorMessage: null
    });
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

