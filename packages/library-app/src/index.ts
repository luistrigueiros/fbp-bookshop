import { Hono } from 'hono';
import { honoLogger } from '@logtape/hono';
import { setupLogging, runMigrations, splitMigrationStatements } from 'library-data-layer';
import type { D1Database, R2Bucket } from '@cloudflare/workers-types';
import { migrations } from '@/migrations';
import { handleMediaUpload } from '@/handlers/mediaUpload';
import { handleMediaProxy } from '@/handlers/mediaProxy';
import { handleTrpc } from '@/handlers/trpc';

type Bindings = {
  DB: D1Database;
  MEDIA_BUCKET: R2Bucket;
  ENVIRONMENT?: string;
  ASSETS?: { fetch: typeof fetch };
};

const app = new Hono<{ Bindings: Bindings }>();

let migrationsApplied = false;

app.use('*', honoLogger());
app.use('*', async (c, next) => {
  await setupLogging({ environment: c.env.ENVIRONMENT });
  await next();
});

app.use('/api/*', async (c, next) => {
  if (!migrationsApplied) {
    const allStatements = migrations.flatMap((m: { content: string }) => splitMigrationStatements(m.content));
    await runMigrations(c.env.DB, allStatements);
    migrationsApplied = true;
  }
  await next();
});

app.post('/api/books/:bookId/media', handleMediaUpload);
app.get('/api/media/*', handleMediaProxy);
app.all('/api/*', handleTrpc);

app.get('*', async (c) => {
  if (c.env.ASSETS) {
    const url = new URL(c.req.url);
    url.pathname = '/';
    return await c.env.ASSETS.fetch(new Request(url.toString(), c.req as any));
  }
  return c.text('Not Found', 404);
});

export default {
  fetch: app.fetch,
};
