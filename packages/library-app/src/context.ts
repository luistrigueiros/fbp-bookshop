import { inferAsyncReturnType } from '@trpc/server';
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { initDB, createRepositories, type DB, type LibraryRepositories } from 'library-data-layer';
import type { D1Database } from '@cloudflare/workers-types';

export interface Env {
  DB: D1Database;
  ENVIRONMENT?: string;
}

export async function createContext(
  opts: FetchCreateContextFnOptions & { env: Env }
) {
  const db = initDB(opts.env.DB);
  const repositories = createRepositories(db);

  return {
    req: opts.req,
    resHeaders: opts.resHeaders,
    db,
    repositories,
    env: opts.env,
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;
