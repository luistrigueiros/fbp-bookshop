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
  genreIds: z.array(z.number()).optional(),
  publisherId: z.number().nullable().optional(),
});

export const BookListQuerySchema = z.object({
  limit: z.number().min(1).max(100).optional().default(20),
  offset: z.number().min(0).optional().default(0),
  title: z.string().optional(),
  author: z.string().optional(),
  publisherId: z.number().optional(),
  genreId: z.number().optional(),
});

export const booksRouter = router({
  list: publicProcedure
    .input(BookListQuerySchema.optional().default({ limit: 20, offset: 0 }))
    .query(async ({ ctx, input }) => {
      return ctx.repositories.books.findWithFilters(input);
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
