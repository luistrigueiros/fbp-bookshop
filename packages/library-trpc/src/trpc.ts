import { initTRPC } from '@trpc/server';
import { type LibraryRepositories } from 'library-data-layer';

export interface tRPCContext {
  repositories: LibraryRepositories;
}

const t = initTRPC.context<tRPCContext>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
