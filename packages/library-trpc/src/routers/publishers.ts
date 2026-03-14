import { z } from 'zod';
import { NamePayloadSchema, CategoryListQuerySchema } from '../schemas';
import { router, publicProcedure } from '../trpc';

export const publishersRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.repositories.publishers.findAll();
  }),

  listWithCounts: publicProcedure
    .input(CategoryListQuerySchema)
    .query(async ({ ctx, input }) => {
      return ctx.repositories.publishers.findWithBookCounts(input);
    }),

  create: publicProcedure
    .input(NamePayloadSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.repositories.publishers.create(input);
    }),
    
  update: publicProcedure
    .input(z.object({
      id: z.number(),
      data: NamePayloadSchema
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.repositories.publishers.update(input.id, input.data);
    }),
    
  delete: publicProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      return ctx.repositories.publishers.delete(input);
    }),
});
