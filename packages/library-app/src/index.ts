import { Hono } from 'hono';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from 'library-trpc';
import { createContext } from './context';
import { honoLogger } from '@logtape/hono';
import { setupLogging, runMigrations, splitMigrationStatements } from 'library-data-layer';
import type { D1Database } from '@cloudflare/workers-types';
import { migrations } from './migrations';


type Bindings = {
  DB: D1Database;
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
    const allStatements = migrations.flatMap((m) => splitMigrationStatements(m.content));
    await runMigrations(c.env.DB, allStatements);
    migrationsApplied = true;
  }
  await next();
});

// tRPC API setup
app.all('/api/*', (c) => {
  return fetchRequestHandler({
    endpoint: '/api',
    req: c.req.raw,
    router: appRouter,
    createContext: (opts) => createContext({ ...opts, ...{ env: c.env } }),
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

