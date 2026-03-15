import type { Context } from 'hono';
import type { D1Database, R2Bucket } from '@cloudflare/workers-types';

type Bindings = {
  DB: D1Database;
  MEDIA_BUCKET: R2Bucket;
  ENVIRONMENT?: string;
  ASSETS?: { fetch: typeof fetch };
};

export async function handleMediaProxy(c: Context<{ Bindings: Bindings }>) {
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
}
