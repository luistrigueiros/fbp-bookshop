import { Hono } from 'hono';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from 'library-trpc';
import { createContext } from '@/context';
import { honoLogger } from '@logtape/hono';
import { setupLogging, runMigrations, splitMigrationStatements, initDB, createRepositories } from 'library-data-layer';
import type { NewBookMedia } from 'library-data-layer';
import type { D1Database, R2Bucket } from '@cloudflare/workers-types';
import { migrations } from '@/migrations';
import { buildMediaKey, buildThumbnailKey } from '@/media/r2Keys';
import { processImage } from '@/media/imageProcessor';
import { writeManifest } from '@/media/manifest';


type Bindings = {
  DB: D1Database;
  MEDIA_BUCKET: R2Bucket;
  ENVIRONMENT?: string;
  ASSETS?: { fetch: typeof fetch };
};

const app = new Hono<{ Bindings: Bindings }>();

// Track whether migrations have already been applied in this worker instance
let migrationsApplied = false;

app.use('*', honoLogger());
app.use('*', async (c, next) => {
  await setupLogging({ environment: c.env.ENVIRONMENT });
  await next();
});

// Auto-apply DB migrations on the first request so a fresh local D1 database
// is always initialised before any query runs.
app.use('/api/*', async (c, next) => {
  if (!migrationsApplied) {
    const allStatements = migrations.flatMap((m: { content: string }) => splitMigrationStatements(m.content));
    await runMigrations(c.env.DB, allStatements);
    migrationsApplied = true;
  }
  await next();
});

const VALID_MEDIA_CATEGORIES = ['cover', 'back_cover', 'promotional', 'interview', 'event'] as const;
const MAX_FILE_SIZE = 104857600; // 100 MB

// Media upload route
app.post('/api/books/:bookId/media', async (c) => {
  const bookId = parseInt(c.req.param('bookId'), 10);
  if (isNaN(bookId)) {
    return c.json({ error: 'Invalid bookId' }, 400);
  }

  const db = initDB(c.env.DB);
  const repositories = createRepositories(db);

  const bookRecord = await repositories.books.findById(bookId);
  if (!bookRecord) {
    return c.json({ error: 'Book not found' }, 404);
  }

  const formData = await c.req.formData();
  const file = formData.get('file') as File | null;
  const mediaCategory = formData.get('mediaCategory') as string | null;
  const isPrimary = formData.get('isPrimary') as string | null;
  const description = formData.get('description') as string | null;

  if (!file || !mediaCategory) {
    return c.json({ error: 'Missing required fields: file, mediaCategory' }, 400);
  }

  if (!(VALID_MEDIA_CATEGORIES as readonly string[]).includes(mediaCategory)) {
    return c.json({ error: `Invalid mediaCategory. Must be one of: ${VALID_MEDIA_CATEGORIES.join(', ')}` }, 400);
  }

  if (file.size > MAX_FILE_SIZE) {
    return c.json({ error: 'File too large. Maximum size is 100 MB.' }, 413);
  }

  const mimeType = file.type || 'application/octet-stream';
  const filename = file.name || 'upload';
  const timestamp = Date.now();
  const r2Key = buildMediaKey(bookId, mediaCategory, timestamp, filename);
  const fileBuffer = await file.arrayBuffer();

  // Upload to R2
  try {
    await c.env.MEDIA_BUCKET.put(r2Key, fileBuffer, {
      httpMetadata: { contentType: mimeType },
    });
  } catch {
    return c.json({ error: 'Failed to upload file to storage' }, 500);
  }

  // Process image if applicable
  let thumbnailKey: string | null = null;
  let width: number | null = null;
  let height: number | null = null;

  if (mimeType.startsWith('image/')) {
    try {
      const { thumbnail, width: w, height: h } = await processImage(fileBuffer, mimeType);
      thumbnailKey = buildThumbnailKey(bookId, mediaCategory, timestamp, filename);
      await c.env.MEDIA_BUCKET.put(thumbnailKey, thumbnail, {
        httpMetadata: { contentType: 'image/jpeg' },
      });
      width = w;
      height = h;
    } catch {
      // Image processing failure is non-fatal; continue without thumbnail
    }
  }

  // Clear primary if needed
  if (isPrimary === 'true') {
    await repositories.bookMedia.clearPrimary(bookId, mediaCategory);
  }

  // Determine media type
  let mediaType: 'image' | 'video' = 'image';
  if (mimeType.startsWith('video/')) {
    mediaType = 'video';
  }

  const record: NewBookMedia = {
    bookId,
    mediaType,
    mediaCategory,
    r2Key,
    fileName: filename,
    fileSize: file.size,
    mimeType,
    width,
    height,
    thumbnailKey,
    displayOrder: 0,
    isPrimary: isPrimary === 'true',
    description: description ?? null,
    uploadedAt: new Date(),
  };

  const created = await repositories.bookMedia.create(record);

  // Write manifest
  await writeManifest(c.env.MEDIA_BUCKET, bookId, bookRecord);

  return c.json({
    id: created.id,
    r2Key: created.r2Key,
    thumbnailKey: created.thumbnailKey,
    url: `/api/media/${created.r2Key}`,
  });
});

// Media proxy route — must be before the tRPC catch-all
app.get('/api/media/*', async (c) => {
  const r2Key = c.req.path.replace(/^\/api\/media\//, '');
  if (!r2Key) {
    return c.json({ error: 'Missing R2 key' }, 400);
  }

  const object = await c.env.MEDIA_BUCKET.get(r2Key);
  if (!object) {
    return c.json({ error: 'Not found' }, 404);
  }

  const contentType = object.httpMetadata?.contentType ?? 'application/octet-stream';
  return new Response(object.body as unknown as BodyInit, {
    headers: { 'Content-Type': contentType },
  });
});

// tRPC API setup
app.all('/api/*', (c) => {
  return fetchRequestHandler({
    endpoint: '/api',
    req: c.req.raw,
    router: appRouter,
    createContext: (opts: any) => createContext({ ...opts, ...{ env: c.env } }),
  });
});

// SPA Fallback: Serve index.html for unknown routes (e.g., /books)
app.get('*', async (c) => {
  if (c.env.ASSETS) {
    const url = new URL(c.req.url);
    url.pathname = '/'; // Rewrite path to /index.html implicitly by requesting /
    return await c.env.ASSETS.fetch(new Request(url.toString(), c.req as any));
  }
  return c.text('Not Found', 404);
});

export default {
  fetch: app.fetch,
};

