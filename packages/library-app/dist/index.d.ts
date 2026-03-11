import { type AppRouter } from 'library-trpc';
import type { D1Database } from '@cloudflare/workers-types';
export type { AppRouter };
type Bindings = {
    DB: D1Database;
    ENVIRONMENT?: string;
    ASSETS?: {
        fetch: typeof fetch;
    };
};
declare const _default: {
    fetch: (request: Request, Env?: {} | Bindings | undefined, executionCtx?: import("hono").ExecutionContext) => Response | Promise<Response>;
};
export default _default;
