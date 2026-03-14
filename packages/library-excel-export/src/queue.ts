import { sql } from "drizzle-orm";
import { createRepositories, genre, getLibraryLogger, initDB, publisher, setupLogging } from "library-data-layer";
import {ExportEnv, ExportJobStatus, type QueueMessage} from "@/types";

const logger = getLibraryLogger(["library", "excel-export", "queue"]);
const BATCH_SIZE = 100;

async function fetchData(type: string, offset: number, db: any, repositories: any) {
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

  return { data, totalCount };
}

async function handleNextStep(jobId: string, type: string, isLast: boolean, offset: number, env: ExportEnv) {
  if (!isLast) {
    const nextOffset = offset + BATCH_SIZE;
    logger.debug("Continuing {type} export: nextOffset={nextOffset}", { type, nextOffset });
    await env.EXPORT_QUEUE.send({ jobId, type, offset: nextOffset });
  } else {
    logger.info("Finished processing type {type} for jobId {jobId}", { type, jobId });
    if (type === "genres") {
      await env.EXPORT_QUEUE.send({ jobId, type: "publishers", offset: 0 });
    } else if (type === "publishers") {
      await env.EXPORT_QUEUE.send({ jobId, type: "books", offset: 0 });
    } else if (type === "books") {
      logger.info("All types finished for jobId {jobId}. Waiting for Durable Object to finalize.", { jobId });
    }
  }
}

function calculateProgress(type: string, offset: number, dataLength: number, totalCount: number) {
  if (totalCount === 0) return type === "genres" ? 10 : (type === "publishers" ? 20 : 100);
  
  if (type === "genres") {
    return Math.min(10, Math.round((offset + dataLength) / totalCount * 10));
  } else if (type === "publishers") {
    return 10 + Math.min(10, Math.round((offset + dataLength) / totalCount * 10));
  } else {
    return 20 + Math.min(80, Math.round((offset + dataLength) / totalCount * 80));
  }
}

export const handleQueue = async (batch: MessageBatch<QueueMessage>, env: ExportEnv) => {
  await setupLogging({ environment: env.ENVIRONMENT });
  logger.info("Processing queue batch with {count} messages", { count: batch.messages.length });
  
  const db = initDB(env.DB);
  const repositories = createRepositories(db);

  for (const msg of batch.messages) {
    const { jobId, type, offset } = msg.body;
    logger.debug("Processing message: jobId={jobId}, type={type}, offset={offset}", { jobId, type, offset });
    
    try {
      const { data, totalCount } = await fetchData(type, offset, db, repositories);
      logger.debug("Fetched {count} items of type {type} (total: {totalCount})", { count: data.length, type, totalCount });

      const isLast = (offset + data.length) >= totalCount;

      // Send to DO
      logger.debug("Sending chunk to Durable Object: jobId={jobId}, isLast={isLast}", { jobId, isLast });
      const id = env.EXPORT_ASSEMBLER.idFromName(jobId);
      const stub = env.EXPORT_ASSEMBLER.get(id) as DurableObjectStub & { addChunk(batch: any): Promise<void> };
      await stub.addChunk({ jobId, type, data, isLast });

      await handleNextStep(jobId, type, isLast, offset, env);
      
      if (isLast && type === "books") {
        // DO NOT update progress to PROCESSING if we just finished books.
        // The DO will update it to COMPLETED.
        return;
      }

      const progress = calculateProgress(type, offset, data.length, totalCount);
      logger.debug("Updating progress for jobId {jobId}: {progress}%", { jobId, progress });
      await repositories.exports.update(jobId, { 
        status: ExportJobStatus.PROCESSING,
        progress,
        errorMessage: null 
      });
    } catch (error) {
      logger.error("Error processing queue message for jobId {jobId}: {error}", { jobId, error });
      await repositories.exports.update(jobId, {
        status: ExportJobStatus.FAILED,
        errorMessage: error instanceof Error ? error.message : String(error)
      });
    }
  }
};
