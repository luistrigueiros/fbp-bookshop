import { Hono } from 'hono';
import { honoLogger } from '@logtape/hono';
import { setupLogging } from "library-data-layer";
import { ExportAssembler, type Env } from "@/assembler";
import { indexHtml } from "@/views/index.html";
import { handleDownload, handleGetStatus, handleGetStatusById, handlePostExport } from "@/handlers/export";
import { handleQueue } from "@/queue";

export { ExportAssembler };

const app = new Hono<{ Bindings: Env }>();

app.use('*', honoLogger());
app.use('*', async (c, next) => {
  await setupLogging({ environment: c.env.ENVIRONMENT });
  await next();
});

app.post('/export', handlePostExport);
app.get('/status/:jobId', handleGetStatusById);
app.get('/status', handleGetStatus);
app.get('/download/:jobId', handleDownload);
app.get('/', async (c) => c.html(indexHtml));

export default {
  fetch: app.fetch,
  queue: handleQueue,
};
