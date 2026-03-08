import { inferAsyncReturnType } from '@trpc/server';
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { type LibraryRepositories } from 'library-data-layer';
import type { D1Database } from '@cloudflare/workers-types';
export interface Env {
    DB: D1Database;
    ENVIRONMENT?: string;
}
export declare function createContext(opts: FetchCreateContextFnOptions & {
    env: Env;
}): Promise<{
    req: Request<unknown, CfProperties<unknown>>;
    resHeaders: Headers;
    db: import("drizzle-orm/d1").DrizzleD1Database<typeof import("../../library-data-layer/dist/schema")> & {
        $client: globalThis.D1Database;
    };
    repositories: LibraryRepositories;
    env: Env;
}>;
export type Context = inferAsyncReturnType<typeof createContext>;
