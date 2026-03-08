import { z } from 'zod';
import { router, publicProcedure } from '../trpc';

export const NamePayloadSchema = z.object({
  name: z.string()
});

export const gendersRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.repositories.genders.findAll();
  }),
  
  create: publicProcedure
    .input(NamePayloadSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.repositories.genders.create(input);
    }),
});
