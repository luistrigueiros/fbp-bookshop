import { z } from 'zod';
import { BookUpsertSchema, BookListQuerySchema } from '../schemas';
import { router, publicProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const booksRouter = router({
  list: publicProcedure
    .input(BookListQuerySchema.optional().default({ limit: 20, offset: 0 }))
    .query(async ({ ctx, input }) => {
      return ctx.repositories.books.findWithFilters(input);
    }),
  
  getById: publicProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      const book = await ctx.repositories.books.findByIdWithRelations(input);
      if (!book) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Book not found' });
      }
      return book;
    }),
    
  create: publicProcedure
    .input(BookUpsertSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.repositories.books.create(input);
    }),
    
  update: publicProcedure
    .input(z.object({
      id: z.number(),
      data: BookUpsertSchema
    }))
    .mutation(async ({ ctx, input }) => {
      const book = await ctx.repositories.books.update(input.id, input.data);
      if (!book) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Book not found' });
      }
      return book;
    }),
    
  delete: publicProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      const deleted = await ctx.repositories.books.delete(input);
      // Wait, openapi.yaml returns 204 no content, we just return nothing or boolean
      return deleted ? null : null;
    }),
});
