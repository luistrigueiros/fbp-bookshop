import { z } from 'zod';
import { router, publicProcedure } from '../trpc';

export const NamePayloadSchema = z.object({
  name: z.string()
});

export const genresRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.repositories.genres.findAll();
  }),
  
  create: publicProcedure
    .input(NamePayloadSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.repositories.genres.create(input);
    }),

  update: publicProcedure
    .input(z.object({
      id: z.number(),
      data: NamePayloadSchema
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.repositories.genres.update(input.id, input.data);
    }),

  delete: publicProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      return ctx.repositories.genres.delete(input);
    }),
});
