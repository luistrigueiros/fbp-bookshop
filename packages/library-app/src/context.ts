import { inferAsyncReturnType } from '@trpc/server';
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { initDB, createRepositories, type DB } from 'library-data-layer';
import type { D1Database, R2Bucket } from '@cloudflare/workers-types';
import type { tRPCContext } from 'library-trpc';

export interface Env {
  DB: D1Database;
  MEDIA_BUCKET: R2Bucket;
  ENVIRONMENT?: string;
}

export async function createContext(
  opts: FetchCreateContextFnOptions & { env: Env }
): Promise<tRPCContext & { req: Request; resHeaders: Headers; db: DB; env: Env }> {
  const db = initDB(opts.env.DB);
  const repositories = createRepositories(db);

  return {
    req: opts.req,
    resHeaders: opts.resHeaders,
    db,
    repositories,
    env: opts.env,
    r2: opts.env.MEDIA_BUCKET,
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;
