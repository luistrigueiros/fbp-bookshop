import { router, publicProcedure } from '../trpc';
import { booksRouter } from './books';
import { genresRouter } from './genres';
import { publishersRouter } from './publishers';
import { exportRouter } from './export';

export const appRouter = router({
  ping: publicProcedure.query(() => {
    return 'pong';
  }),
  books: booksRouter,
  genres: genresRouter,
  publishers: publishersRouter,
  exports: exportRouter,
});

export type AppRouter = typeof appRouter;
