import { Hono } from 'hono';
import { honoLogger } from '@logtape/hono';
import { setupLogging, initDB, createRepositories } from "library-data-layer";
import { ExportAssembler } from "@/assembler";
import { handleDownload, handleGetStatus, handleGetStatusById, handlePostExport } from "@/handlers/export";
import { landingPage } from "@/handlers/landingPage";
import { handleQueue } from "@/queue";
import { ExportEnv } from "@/types";
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from 'library-trpc';

export { ExportAssembler };

const app = new Hono<{ Bindings: ExportEnv & { ASSETS?: { fetch: typeof fetch } } }>();

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
    createContext: (opts) => {
      const db = initDB(c.env.DB);
      const repositories = createRepositories(db);
      return {
        ...opts,
        repositories,
        env: c.env,
      };
    },
  });
});

app.get('/download/:jobId', handleDownload);
app.post('/export', handlePostExport);
app.get('/status', handleGetStatus);
app.get('/status/:jobId', handleGetStatusById);

app.get('/', landingPage);

// SPA fallback: Serve index.html or assets
app.get('*', async (c) => {
  if (c.env.ASSETS) {
    return await c.env.ASSETS.fetch(c.req.raw);
  }
  return c.text('Not Found', 404);
});

export default {
  fetch: app.fetch,
  queue: handleQueue,
};
