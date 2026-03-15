import { initTRPC } from '@trpc/server';
import type { R2Bucket } from '@cloudflare/workers-types';
import { type LibraryRepositories } from 'library-data-layer';

export interface tRPCContext {
  repositories: LibraryRepositories;
  env?: any;
  r2?: R2Bucket;
}

const t = initTRPC.context<tRPCContext>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
