import { eq } from "drizzle-orm";
import type { DB } from "../db";
import { exportJob } from "../schema";
import type { ExportJobRecord, NewExportJob } from "../schema/types";
import { layerLogger } from "../logging";

export class ExportJobRepository {
  constructor(private db: DB) {}

  /**
   * Create a new export job
   */
  async create(data: NewExportJob): Promise<ExportJobRecord> {
    layerLogger.debug("Creating new export job: {id}", { id: data.id });
    const result = await this.db.insert(exportJob).values(data).returning();
    const createdJob = result[0]!;
    layerLogger.info("Created export job: {id} (Status: {status})", {
      id: createdJob.id,
      status: createdJob.status,
    });
    return createdJob;
  }

  /**
   * Get export job by ID
   */
  async findById(id: string): Promise<ExportJobRecord | undefined> {
    const result = await this.db
      .select()
      .from(exportJob)
      .where(eq(exportJob.id, id));
    return result[0];
  }

  /**
   * Update an export job
   */
  async update(
    id: string,
    data: Partial<Omit<NewExportJob, "id">>,
  ): Promise<ExportJobRecord | undefined> {
    layerLogger.debug("Updating export job ID: {id}", { id });
    const result = await this.db
      .update(exportJob)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(exportJob.id, id))
      .returning();
    const updatedJob = result[0];
    if (updatedJob) {
      layerLogger.info("Updated export job ID: {id} (Status: {status})", {
        id,
        status: updatedJob.status,
      });
    }
    return updatedJob;
  }

  /**
   * Delete an export job
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .delete(exportJob)
      .where(eq(exportJob.id, id))
      .returning();
    return result.length > 0;
  }

  /**
   * List all export jobs
   */
  async findAll(): Promise<ExportJobRecord[]> {
    return this.db.select().from(exportJob).orderBy(exportJob.createdAt);
  }
}
