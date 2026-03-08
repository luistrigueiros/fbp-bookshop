import { z } from 'zod';
import { router, publicProcedure } from '../trpc';

export const NamePayloadSchema = z.object({
  name: z.string()
});

export const publishersRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.repositories.publishers.findAll();
  }),
  
  create: publicProcedure
    .input(NamePayloadSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.repositories.publishers.create(input);
    }),
});
