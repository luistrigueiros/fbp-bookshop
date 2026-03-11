import { inferAsyncReturnType } from '@trpc/server';
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { type DB } from 'library-data-layer';
import type { D1Database } from '@cloudflare/workers-types';
import type { tRPCContext } from 'library-trpc';
export interface Env {
    DB: D1Database;
    ENVIRONMENT?: string;
}
export declare function createContext(opts: FetchCreateContextFnOptions & {
    env: Env;
}): Promise<tRPCContext & {
    req: Request;
    resHeaders: Headers;
    db: DB;
    env: Env;
}>;
export type Context = inferAsyncReturnType<typeof createContext>;
