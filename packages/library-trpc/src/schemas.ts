import { z } from 'zod';

export const NamePayloadSchema = z.object({
  name: z.string()
});

export const BookUpsertSchema = z.object({
  title: z.string(),
  author: z.string().nullable().optional(),
  isbn: z.string().nullable().optional(),
  barcode: z.string().nullable().optional(),
  price: z.number().nullable().optional(),
  language: z.string().nullable().optional(),
  genreIds: z.array(z.number()).optional(),
  publisherId: z.number().nullable().optional(),
  stock: z.object({
    bookshelf: z.string().nullable().optional(),
    numberOfCopies: z.number().min(0).optional(),
    numberOfCopiesSold: z.number().min(0).optional(),
  }).optional(),
});

export const BookListQuerySchema = z.object({
  limit: z.number().min(1).max(100).optional().default(20),
  offset: z.number().min(0).optional().default(0),
  title: z.string().optional(),
  author: z.string().optional(),
  publisherId: z.number().optional(),
  genreId: z.number().optional(),
  language: z.string().optional(),
});

export const CategoryListQuerySchema = z.object({
  limit: z.number().min(1).max(100).optional().default(10),
  offset: z.number().min(0).optional().default(0),
  name: z.string().optional(),
});
