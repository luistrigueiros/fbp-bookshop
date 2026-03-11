import { z } from 'zod';
import { NamePayloadSchema } from '@/schemas';
import { router, publicProcedure } from '@/trpc';

export const publishersRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.repositories.publishers.findAll();
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
