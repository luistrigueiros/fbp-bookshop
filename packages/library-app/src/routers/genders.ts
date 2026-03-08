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

  update: publicProcedure
    .input(z.object({
      id: z.number(),
      data: NamePayloadSchema
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.repositories.genders.update(input.id, input.data);
    }),

  delete: publicProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      return ctx.repositories.genders.delete(input);
    }),
});
