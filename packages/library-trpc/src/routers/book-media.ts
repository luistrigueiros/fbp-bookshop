import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import type { BookMediaWithUrls } from 'library-data-layer';

export const bookMediaRouter = router({
  getByBook: publicProcedure
    .input(z.object({
      bookId: z.number(),
      mediaCategory: z.string().optional(),
    }))
    .query(async ({ ctx, input }): Promise<BookMediaWithUrls[]> => {
      const book = await ctx.repositories.books.findById(input.bookId);
      if (!book) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Book not found' });
      }

      const records = input.mediaCategory
        ? await ctx.repositories.bookMedia.findByBookIdAndCategory(input.bookId, input.mediaCategory)
        : await ctx.repositories.bookMedia.findByBookId(input.bookId);

      return records.map((r) => ({
        ...r,
        url: `/api/media/${r.r2Key}`,
        thumbnailUrl: r.thumbnailKey ? `/api/media/${r.thumbnailKey}` : null,
      }));
    }),

  delete: publicProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ ctx, input }): Promise<void> => {
      const record = await ctx.repositories.bookMedia.findById(input.id);
      if (!record) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Media record not found' });
      }

      if (!ctx.r2) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'R2 storage not available' });
      }

      try {
        await ctx.r2.delete(record.r2Key);
      } catch (err) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to delete media from storage' });
      }

      if (record.thumbnailKey) {
        try {
          await ctx.r2.delete(record.thumbnailKey);
        } catch {
          // best-effort thumbnail deletion
        }
      }

      await ctx.repositories.bookMedia.delete(input.id);

      const remaining = await ctx.repositories.bookMedia.findByBookId(record.bookId);
      if (remaining.length === 0) {
        const bookRecord = await ctx.repositories.books.findById(record.bookId);
        if (bookRecord) {
          try {
            await ctx.r2.delete(`books/${bookRecord.mediaFolderId}/manifest.json`);
          } catch {
            // best-effort manifest deletion
          }
        }
      }
    }),
});
