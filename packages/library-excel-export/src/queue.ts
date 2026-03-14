import { sql } from "drizzle-orm";
import { createRepositories, genre, initDB, publisher } from "library-data-layer";
import { type Env } from "@/assembler";
import { type QueueMessage } from "@/types";

export const handleQueue = async (batch: MessageBatch<QueueMessage>, env: Env) => {
  const db = initDB(env.DB);
  const repositories = createRepositories(db);
  const BATCH_SIZE = 100;

  for (const msg of batch.messages) {
    const { jobId, type, offset } = msg.body;
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

    const isLast = (offset + data.length) >= totalCount;

    // Send to DO
    const id = env.EXPORT_ASSEMBLER.idFromName(jobId);
    const stub = env.EXPORT_ASSEMBLER.get(id) as DurableObjectStub & { addChunk(batch: any): Promise<void> };
    await stub.addChunk({ type, data, isLast });

    // Handle next step
    if (!isLast) {
      // Continue this type
      await env.EXPORT_QUEUE.send({ jobId, type, offset: offset + BATCH_SIZE });
    } else {
      // Type finished, move to next type if any
      if (type === "genres") {
        await env.EXPORT_QUEUE.send({ jobId, type: "publishers", offset: 0 });
      } else if (type === "publishers") {
        await env.EXPORT_QUEUE.send({ jobId, type: "books", offset: 0 });
      } else if (type === "books") {
        // All finished! Update job status.
        await repositories.exports.update(jobId, {
          status: "completed",
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
    
    await repositories.exports.update(jobId, { progress });
  }
};
