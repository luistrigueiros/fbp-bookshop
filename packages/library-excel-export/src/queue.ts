import { sql } from "drizzle-orm";
import { createRepositories, genre, getLibraryLogger, initDB, publisher, setupLogging } from "library-data-layer";
import {ExportEnv, ExportJobStatus, type QueueMessage} from "@/types";

const logger = getLibraryLogger(["library", "excel-export", "queue"]);

export const handleQueue = async (batch: MessageBatch<QueueMessage>, env: ExportEnv) => {
  await setupLogging({ environment: env.ENVIRONMENT });
  logger.info("Processing queue batch with {count} messages", { count: batch.messages.length });
  
  const db = initDB(env.DB);
  const repositories = createRepositories(db);
  const BATCH_SIZE = 100;

  for (const msg of batch.messages) {
    const { jobId, type, offset } = msg.body;
    logger.debug("Processing message: jobId={jobId}, type={type}, offset={offset}", { jobId, type, offset });
    
    try {
      let data: unknown[] = [];
      let totalCount = 0;

      if (type === "genres") {
        data = await db.query.genre.findMany({
          limit: BATCH_SIZE,
          offset: offset,
        });
        const countResult = await db.select({ count: sql`count(*)` }).from(genre);
        totalCount = Number((countResult[0] as { count: unknown })?.count || 0);
      } else if (type === "publishers") {
        data = await db.query.publisher.findMany({
          limit: BATCH_SIZE,
          offset: offset,
        });
        const countResult = await db.select({ count: sql`count(*)` }).from(publisher);
        totalCount = Number((countResult[0] as { count: unknown })?.count || 0);
      } else if (type === "books") {
        const filterResult = await repositories.books.findWithFilters({
          limit: BATCH_SIZE,
          offset: offset,
        });
        data = filterResult.data;
        totalCount = filterResult.total;
      }

      logger.debug("Fetched {count} items of type {type} (total: {totalCount})", { count: data.length, type, totalCount });

      const isLast = (offset + data.length) >= totalCount;

      // Send to DO
      logger.debug("Sending chunk to Durable Object: jobId={jobId}, isLast={isLast}", { jobId, isLast });
      const id = env.EXPORT_ASSEMBLER.idFromName(jobId);
      const stub = env.EXPORT_ASSEMBLER.get(id) as DurableObjectStub & { addChunk(batch: any): Promise<void> };
      await stub.addChunk({ type, data, isLast });

      // Handle next step
      if (!isLast) {
        // Continue this type
        const nextOffset = offset + BATCH_SIZE;
        logger.debug("Continuing {type} export: nextOffset={nextOffset}", { type, nextOffset });
        await env.EXPORT_QUEUE.send({ jobId, type, offset: nextOffset });
      } else {
        // Type finished, move to next type if any
        logger.info("Finished processing type {type} for jobId {jobId}", { type, jobId });
        if (type === "genres") {
          await env.EXPORT_QUEUE.send({ jobId, type: "publishers", offset: 0 });
        } else if (type === "publishers") {
          await env.EXPORT_QUEUE.send({ jobId, type: "books", offset: 0 });
        } else if (type === "books") {
          // All finished! Update job status.
          logger.info("All types finished for jobId {jobId}. Updating status to completed.", { jobId });
          await repositories.exports.update(jobId, {
            status: ExportJobStatus.COMPLETED,
            progress: 100,
            url: `/download/${jobId}`
          });
        }
      }
      
      // Update progress
      let progress = 0;
      if (type === "genres") progress = totalCount > 0 ? Math.min(10, Math.round((offset + data.length) / totalCount * 10)) : 10;
      else if (type === "publishers") progress = 10 + (totalCount > 0 ? Math.min(10, Math.round((offset + data.length) / totalCount * 10)) : 10);
      else if (type === "books") progress = 20 + (totalCount > 0 ? Math.min(80, Math.round((offset + data.length) / totalCount * 80)) : 80);
      
      logger.debug("Updating progress for jobId {jobId}: {progress}%", { jobId, progress });
      await repositories.exports.update(jobId, { 
        status: ExportJobStatus.PROCESSING,
        progress 
      });
    } catch (error) {
      logger.error("Error processing queue message for jobId {jobId}: {error}", { jobId, error });
      await repositories.exports.update(jobId, {
        status: ExportJobStatus.FAILED,
        error: error instanceof Error ? error.message : String(error)
      });
      // Optionally rethrow if you want the queue to retry, but requirement says "always updated in the table"
      // and usually for export failures we want to mark it as failed and not retry indefinitely.
      // throw error; 
    }
  }
};
