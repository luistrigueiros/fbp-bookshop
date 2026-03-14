import { z } from 'zod';
import { ExportJobSchema } from '../schemas';
import { router, publicProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const exportRouter = router({
  list: publicProcedure
    .query(async ({ ctx }) => {
      return ctx.repositories.exports.findAll();
    }),

  getById: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const job = await ctx.repositories.exports.findById(input);
      if (!job) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Export job not found' });
      }
      return job;
    }),

  start: publicProcedure
    .mutation(async ({ ctx }) => {
      const jobId = crypto.randomUUID();
      
      try {
        // Create job record
        await ctx.repositories.exports.create({
          id: jobId,
          status: 'pending',
          progress: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        
        // Check if queue exists in env
        if (ctx.env?.EXPORT_QUEUE) {
          await ctx.env.EXPORT_QUEUE.send({
            jobId,
            type: "genres",
            offset: 0
          });
        } else {
          throw new TRPCError({ 
            code: 'INTERNAL_SERVER_ERROR', 
            message: 'Export queue not configured' 
          });
        }
        
        return { jobId, status: 'processing' };
      } catch (error) {
        // If something fails before queue starts, mark as failed if record exists
        const existingJob = await ctx.repositories.exports.findById(jobId);
        if (existingJob) {
          await ctx.repositories.exports.update(jobId, {
            status: 'failed',
            errorMessage: error instanceof Error ? error.message : String(error)
          });
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : String(error)
        });
      }
    }),
});
