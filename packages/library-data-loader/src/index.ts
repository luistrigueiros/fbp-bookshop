import { Hono } from 'hono'
import { D1Database, R2Bucket, Queue } from "@cloudflare/workers-types";
import { handleUpload, processExcelQueueMessage, processBookQueueMessage, type UploadQueueMessage, type BookQueueMessage } from '@/upload-service'
import { landingPage } from '@/landing-page'
import { dbValidationMiddleware, type Variables } from '@/db-middleware'
import { setupLogging, initDB, loaderLogger, createRepositories } from 'library-data-layer'
import { honoLogger } from '@logtape/hono'

function resolveEnvironment() {
  return typeof process !== 'undefined' ? process.env.ENVIRONMENT : 'development';
}

// Initialize logging with default (development) settings
setupLogging({ environment: resolveEnvironment() })

type Bindings = {
  DB: D1Database
  UPLOADS_BUCKET: R2Bucket
  UPLOAD_QUEUE: Queue<UploadQueueMessage>
  BOOK_QUEUE: Queue<BookQueueMessage>
  ENVIRONMENT?: string
}

const app = new Hono<{ Bindings: Bindings, Variables: Variables }>()

// Register LogTape middleware for request logging
app.use('*', honoLogger())

// Register database validation middleware for all routes
app.use('*', async (c, next) => {
  // Ensure logging is configured with the correct environment from bindings
  await setupLogging({ environment: c.env.ENVIRONMENT });
  await next();
})
app.use('*', dbValidationMiddleware())

app.get('/', (c) => {
  return c.html(landingPage)
})

app.post('/upload', async (c) => {
  const body = await c.req.parseBody()
  const file = body['file']

  if (!file || !(file instanceof File)) {
    return c.json({ error: 'No file uploaded' }, 400)
  }

  try {
    const result = await handleUpload(file, c.env.UPLOADS_BUCKET, c.env.UPLOAD_QUEUE, c.get('db'))
    return c.json(result, 202)
  } catch (error) {
    loaderLogger.error("Upload handler failed: {error}", { error: (error as Error).message });
    return c.json({ error: (error as Error).message }, 500)
  }
})

app.get('/upload-status/:key{.+}', async (c) => {
  const key = c.req.param('key')
  const repos = createRepositories(c.get('db'))
  
  const status = await repos.uploads.findByKey(key)
  if (!status) {
    return c.json({ error: 'Upload not found' }, 404)
  }
  
  return c.json(status)
})

/**
 * Cloudflare Queue consumer
 */
export default {
  // Hono app fetch handler
  fetch: app.fetch,

  // Queue consumer handler
  async queue(batch: MessageBatch<any>, env: Bindings): Promise<void> {
    await setupLogging({ environment: env.ENVIRONMENT });
    const db = initDB(env.DB);
    
    for (const message of batch.messages) {
      try {
        if ('key' in message.body && !('book' in message.body)) {
          // It's an Excel upload message
          const { key } = message.body as UploadQueueMessage;
          await processExcelQueueMessage(key, env.UPLOADS_BUCKET, env.BOOK_QUEUE, db);
        } else if ('book' in message.body) {
          // It's an individual book processing message
          await processBookQueueMessage(message.body as BookQueueMessage, db);
        } else {
          loaderLogger.error("Unknown queue message type: {body}", { body: JSON.stringify(message.body) });
        }
        message.ack();
      } catch (error) {
        loaderLogger.error("Queue processing failed for message {id}: {error}", { 
          id: message.id, 
          error: (error as Error).message 
        });
        // Message will be retried based on queue configuration if not acked
      }
    }
  }
}
