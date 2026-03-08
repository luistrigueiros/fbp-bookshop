import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const BookUpsertSchema = z.object({
  title: z.string(),
  author: z.string().nullable().optional(),
  isbn: z.string().nullable().optional(),
  barcode: z.string().nullable().optional(),
  price: z.number().nullable().optional(),
  language: z.string().nullable().optional(),
  genderId: z.number().nullable().optional(),
  publisherId: z.number().nullable().optional(),
});

export const booksRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.repositories.books.findAll();
  }),
  
  getById: publicProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      const book = await ctx.repositories.books.findById(input);
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
