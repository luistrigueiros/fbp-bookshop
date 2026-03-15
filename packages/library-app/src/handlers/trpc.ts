import type { Context } from 'hono';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from 'library-trpc';
import { createContext } from '@/context';
import type { D1Database, R2Bucket } from '@cloudflare/workers-types';

type Bindings = {
  DB: D1Database;
  MEDIA_BUCKET: R2Bucket;
  ENVIRONMENT?: string;
  ASSETS?: { fetch: typeof fetch };
};

export function handleTrpc(c: Context<{ Bindings: Bindings }>) {
  return fetchRequestHandler({
    endpoint: '/api',
    req: c.req.raw,
    router: appRouter,
    createContext: (opts: any) => createContext({ ...opts, env: c.env }),
  });
}
