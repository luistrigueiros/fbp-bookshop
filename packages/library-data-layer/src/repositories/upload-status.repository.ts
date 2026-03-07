import { eq } from "drizzle-orm";
import { uploadStatus } from "../schema";
import { UploadStatus, NewUploadStatus } from "../schema/types";
import { DB } from "../db";
import { layerLogger } from "../logging";

export class UploadStatusRepository {
  constructor(private db: DB) {}

  /**
   * Create a new upload status record
   */
  async create(data: NewUploadStatus): Promise<UploadStatus> {
    layerLogger.debug("Creating upload status for key: {key}", { key: data.key });
    const [result] = await this.db.insert(uploadStatus).values(data).returning();
    return result;
  }

  /**
   * Update an existing upload status record
   */
  async update(key: string, data: Partial<NewUploadStatus>): Promise<UploadStatus | undefined> {
    layerLogger.debug("Updating upload status for key: {key}", { key });
    const [result] = await this.db
      .update(uploadStatus)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(uploadStatus.key, key))
      .returning();
    return result;
  }

  /**
   * Find an upload status record by key
   */
  async findByKey(key: string): Promise<UploadStatus | undefined> {
    layerLogger.debug("Finding upload status by key: {key}", { key });
    const [result] = await this.db
      .select()
      .from(uploadStatus)
      .where(eq(uploadStatus.key, key))
      .limit(1);
    return result;
  }
}
