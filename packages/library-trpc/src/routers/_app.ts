import { router } from '../trpc';
import { booksRouter } from './books';
import { genresRouter } from './genres';
import { publishersRouter } from './publishers';

export const appRouter = router({
  books: booksRouter,
  genres: genresRouter,
  publishers: publishersRouter,
});

export type AppRouter = typeof appRouter;
