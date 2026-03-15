import type { Context } from 'hono';
import { initDB, createRepositories } from 'library-data-layer';
import type { NewBookMedia } from 'library-data-layer';
import type { D1Database, R2Bucket } from '@cloudflare/workers-types';
import { buildMediaKey, buildThumbnailKey } from '@/media/r2Keys';
import { processImage } from '@/media/imageProcessor';
import { writeManifest } from '@/media/manifest';

type Bindings = {
  DB: D1Database;
  MEDIA_BUCKET: R2Bucket;
  ENVIRONMENT?: string;
  ASSETS?: { fetch: typeof fetch };
};

const VALID_MEDIA_CATEGORIES = ['cover', 'back_cover', 'promotional', 'interview', 'event'] as const;
const MAX_FILE_SIZE = 104857600; // 100 MB

export async function handleMediaUpload(c: Context<{ Bindings: Bindings }>) {
  const bookIdParam = c.req.param('bookId');
  const bookId = bookIdParam ? parseInt(bookIdParam, 10) : NaN;
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
  const r2Key = buildMediaKey(bookRecord.mediaFolderId, mediaCategory, timestamp, filename);
  const fileBuffer = await file.arrayBuffer();

  // For images, optimise before storing — use the optimised buffer as the primary file
  let storedBuffer: ArrayBuffer = fileBuffer;
  let storedMimeType = mimeType;
  let thumbnailKey: string | null = null;
  let width: number | null = null;
  let height: number | null = null;

  if (mimeType.startsWith('image/')) {
    try {
      const { optimised, thumbnail, width: w, height: h } = await processImage(fileBuffer, mimeType);
      storedBuffer = optimised;
      storedMimeType = 'image/jpeg';
      thumbnailKey = buildThumbnailKey(bookRecord.mediaFolderId, mediaCategory, timestamp, filename);
      await c.env.MEDIA_BUCKET.put(thumbnailKey, thumbnail, {
        httpMetadata: { contentType: 'image/jpeg' },
      });
      width = w;
      height = h;
    } catch {
      // Image processing failure is non-fatal; fall back to original
    }
  }

  try {
    await c.env.MEDIA_BUCKET.put(r2Key, storedBuffer, {
      httpMetadata: { contentType: storedMimeType },
    });
  } catch {
    return c.json({ error: 'Failed to upload file to storage' }, 500);
  }

  if (isPrimary === 'true') {
    await repositories.bookMedia.clearPrimary(bookId, mediaCategory);
  }

  const mediaType: 'image' | 'video' = mimeType.startsWith('video/') ? 'video' : 'image';

  const record: NewBookMedia = {
    bookId,
    mediaType,
    mediaCategory,
    r2Key,
    fileName: filename,
    fileSize: storedBuffer.byteLength,
    mimeType: storedMimeType,
    width,
    height,
    thumbnailKey,
    displayOrder: 0,
    isPrimary: isPrimary === 'true',
    description: description ?? null,
    uploadedAt: new Date(),
  };

  const created = await repositories.bookMedia.create(record);

  await writeManifest(c.env.MEDIA_BUCKET, bookRecord);

  return c.json({
    id: created.id,
    r2Key: created.r2Key,
    thumbnailKey: created.thumbnailKey,
    url: `/api/media/${created.r2Key}`,
  });
}
