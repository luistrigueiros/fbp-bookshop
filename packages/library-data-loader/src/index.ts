import { Hono } from 'hono'
import { D1Database } from "@cloudflare/workers-types";
import { processUpload } from '@/upload-service'
import { landingPage } from '@/landing-page'
import { dbValidationMiddleware, type Variables } from '@/db-middleware'
import { setupLogging } from 'library-data-layer'
import { honoLogger } from '@logtape/hono'

// Initialize logging
setupLogging()

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings, Variables: Variables }>()

// Register LogTape middleware for request logging
app.use('*', honoLogger())

// Register database validation middleware for all routes
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
    const result = await processUpload(file, c.get('db'))
    return c.json(result)
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500)
  }
})

export default app
