import { Hono } from 'hono';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from './routers/_app';
import { createContext } from './context';
import { honoLogger } from '@logtape/hono';
import { setupLogging } from 'library-data-layer';
import type { D1Database } from '@cloudflare/workers-types';

type Bindings = {
  DB: D1Database;
  ENVIRONMENT?: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', honoLogger());
app.use('*', async (c, next) => {
  await setupLogging({ environment: c.env.ENVIRONMENT });
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

export default {
  fetch: app.fetch,
};
