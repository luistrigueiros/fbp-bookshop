import { z } from 'zod';
import { NamePayloadSchema, CategoryListQuerySchema } from '../schemas';
import { router, publicProcedure } from '../trpc';

export const genresRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.repositories.genres.findAll();
  }),

  listWithCounts: publicProcedure
    .input(CategoryListQuerySchema)
    .query(async ({ ctx, input }) => {
      return ctx.repositories.genres.findWithBookCounts(input);
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
